import asyncio

from app.db.database import SessionLocal
from app.services.alert_service import evaluate_offline_alert_rules

OFFLINE_CHECK_INTERVAL_SECONDS = 60

async def run_offline_monitor() -> None:
    # Background loop that checks for offline devices. It runs for as long as the FastAPI app is running.
    while True:
        db = SessionLocal()
        try:
            evaluate_offline_alert_rules(db)
            db.commit()
        except Exception:
            # If something goes wrong, rollback so the session does not keep a broken transaction open.
            db.rollback()
            
            # Re-raise is not used because we do not want one failed check to permanently stop the monitor.
            # Later we can replace this with proper logging.
        finally:
            db.close()
        
        await asyncio.sleep(OFFLINE_CHECK_INTERVAL_SECONDS)