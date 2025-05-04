from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.chat_model import ChatMessage
from datetime import datetime

router = APIRouter()
active_connections = {}

# ✅ HTTP GET route to fetch saved messages
@router.get("/trips/{trip_id}/chat")
def get_chat_history(trip_id: int, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.trip_id == trip_id).order_by(ChatMessage.timestamp).all()
    return [
        {
            "user_id": msg.user_id,
            "message": msg.message,
            "timestamp": msg.timestamp.isoformat()
        }
        for msg in messages
    ]

# ✅ WebSocket endpoint for real-time chat
@router.websocket("/ws/trips/{trip_id}")
async def websocket_endpoint(websocket: WebSocket, trip_id: int, user_id: int, db: Session = Depends(get_db)):
    await websocket.accept()

    if trip_id not in active_connections:
        active_connections[trip_id] = []
    active_connections[trip_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            message_text = data["message"]

            # Save message
            new_message = ChatMessage(
                trip_id=trip_id,
                user_id=user_id,
                message=message_text,
                timestamp=datetime.utcnow()
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)

            # Broadcast
            for conn in active_connections[trip_id]:
                await conn.send_json({
                    "user_id": user_id,
                    "message": message_text,
                    "timestamp": new_message.timestamp.isoformat()
                })
    except WebSocketDisconnect:
        active_connections[trip_id].remove(websocket)
