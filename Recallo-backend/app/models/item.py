# In a real app, you would import Base from your database setup
# from app.db.base_class import Base
# from sqlalchemy import Column, Integer, String, ForeignKey

class Item:
    """
    This represents your Database Table.
    Using SQLAlchemy, it would look like:
    
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    """
    id: int
    title: str
    description: str
    owner_id: int
