import argparse
import random
import time
import requests

from scenarios.normal import NormalScenario

DEFAULT_API_URL = "http://localhost:8000/telemetry"

def parse_arguments() -> argparse.Namespace:
    """
    Read command-line arguments provided when starting the simulator.
    Example:
    python simulator.py \
        --device dev_331510252bc5120b \
        --api-key cg_live_xxxxx \
        --scenario normal
    """
    parser = argparse.ArgumentParser(
        description="ColdGrid AI device telemetry simulator."
    )
    
    parser.add_argument(
        "--device",
        required=True,
        help="Public device ID example dev_331510252bc5120b.",
    )       # Public device ID created through POST /devices.
    
    parser.add_argument(
        "--api-key",
        required=True,
        help="Raw device API key used for telemetry authentication."
    )       # Raw device API key returned once when the device was created.
    
    parser.add_argument(
        "--scenario",
        default="normal",
        choices=["normal"],
        help="Simulation scenario to run.",
    )       # Scenario controlling simulated device behaviour.
    
    parser.add_argument(
        "--api-url",
        default=DEFAULT_API_URL,
        help="Telemetry ingestion endpoint URL.",
    )       #Backend API endpoint.
    
    return parser.parse_args()

def create_scenario(scenario_name: str) -> NormalScenario:
    """
    Create the selected scenario generator.
    """
    if scenario_name == "normal":
        return NormalScenario()
    
    # This should not occur because argparse validates allowed choices.
    raise ValueError(f"Unsupported scenario: {scenario_name}")

def send_telemetry(api_url: str, api_key: str, payload: dict,) -> None:
    headers = {
        "X-Device-API-Key": api_key,
        "Content-Type": "application/json",
    }
    
    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=10,)
        
        if response.status_code == 201:
            saved_reading = response.json()
            print(
                "Telemetry saved:"
                f" temperature={saved_reading['temperature']}°C,"
                f" battery={saved_reading['batteryLevel']}%,"
                f" status={saved_reading['status']}"
            )
        else:
            print(
                f"Telemetry rejected: status={response.status_code},"
                f" response={response.text}"
            )
        
    except requests.RequestException as error:
        print(f"Could not reach backend API: {error}")
        
def main() -> None:
    """
    Start the continuous telemetry simulation loop.
    A new reading is generated and sent every 5 to 10 seconds. Press CTRL + C to stop the simulator.
    """
    args = parse_arguments()
    scenario = create_scenario(args.scenario)
    
    print("Starting ColdGrid AI simulator...")
    print(f"Device: {args.device}")
    print(f"Scenario: {args.scenario}")
    print(f"Sending telemetry to: {args.api_url}")
    print("Press CTRL + C to stop.\n")
    
    try:
        while True:
            reading = scenario.generate_reading()       # Generate one scenario-specific reading.
            payload = reading.to_api_payload(device_id=args.device)      # Convert the reading into the API request payload.
            send_telemetry(api_url=args.api_url, api_key=args.api_key, payload=payload)      # Send the reading to FastAPI.
            delay_seconds = random.randint(5, 10)        # Wait a realistic interval before sending the next reading.
            time.sleep(delay_seconds)
    
    except KeyboardInterrupt:
        print("\nSimulator stopped.")
        
if __name__ == "__main__":
    main()

