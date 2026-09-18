from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class WorkItem(Base):
    __tablename__ = 'work_items'
    id = Column(Integer, primary_key=True)
    source = Column(String(50))
    source_id = Column(String(200))
    title = Column(String(500))
    description = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    due_date = Column(DateTime, nullable=True)
    owner_id = Column(String(100), nullable=True)
    team_id = Column(String(100), nullable=True)
    status = Column(String(50), default='open')
    metadata_ = Column('metadata', JSON, nullable=True)

class PriorityRun(Base):
    __tablename__ = 'priorities'
    id = Column(Integer, primary_key=True)
    item_id = Column(Integer, ForeignKey('work_items.id'))
    score = Column(Integer)
    confidence = Column(String(50))
    rationale = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class AuditTrail(Base):
    __tablename__ = 'audit_trail'
    id = Column(Integer, primary_key=True)
    item_id = Column(Integer, ForeignKey('work_items.id'))
    action = Column(String(100))
    actor_id = Column(String(100))
    details = Column(JSON)
    timestamp = Column(DateTime, server_default=func.now())
