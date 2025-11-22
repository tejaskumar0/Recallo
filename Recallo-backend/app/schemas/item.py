from pydantic import BaseModel

# Shared properties
class ItemBase(BaseModel):
    title: str
    description: str | None = None

# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass

# Properties to return to client
class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
