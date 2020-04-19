import Chatkit from '@pusher/chatkit-client'


export default ({ state, actions }, { id, token }) =>
{
  
  let user = {
    id: "1",
    name: "name",
    rooms: [
      {
        id: "1",
        createdAt: "",
        createdByUserId: "",
        customData: "",
        isPrivate: true,
        lastMessageAt: "",
        name: "Group A",
        unreadCount: 1,
        updatedAt: "",
        users: [
          {
            id: "1",
            name: "name1"
          }
        ]
      },
      {
        id: "1",
        createdAt: "",
        createdByUserId: "",
        customData: "",
        isPrivate: true,
        lastMessageAt: "",
        name: "Group B",
        unreadCount: 1,
        updatedAt: "",
        users: [
          {
            id: "1",
            name: "name1"
          }
        ]
      }
    ]
  };

  actions.setUser(user);

  let message = {
    "1": [
      {
        
      }
    ]
  }
  actions.setMessage(message);
}
