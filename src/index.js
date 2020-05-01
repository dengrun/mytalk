import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment';
import { version } from '../package.json'
import './index.css'

import UserHeader from './components/UserHeader'
import { UserList } from './components/UserList'
import { MessageList } from './components/MessageList'
import { TypingIndicator } from './components/TypingIndicator'
import { CreateMessageForm } from './components/CreateMessageForm'
import { RoomList } from './components/RoomList'
import { RoomHeader } from './components/RoomHeader'
import { CreateRoomForm } from './components/CreateRoomForm'
import { WelcomeScreen } from './components/WelcomeScreen'
import { JoinRoomScreen } from './components/JoinRoomScreen'

import ChatManager from './chatkit'

import { UserSession, AppConfig } from 'blockstack';
import { User, getConfig, configure } from 'radiks';
import { UserGroup } from 'radiks';

import Room from './models/Room.js';
import RoomUser from './models/RoomUser.js';

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig: appConfig })

configure({
  apiServer: 'http://localhost:5000',
  userSession
});

// --------------------------------------
// Application
// --------------------------------------

class View extends React.Component {
  state = {
    user: {},
    room: {},
    messages: {},
    typing: {},
    sidebarOpen: false,
    userListOpen: window.innerWidth > 1000,

    roomlist: [
        
    ],
    selectedroom: '',
    room: new Room(),
  }

  actions = {
    // --------------------------------------
    // UI
    // --------------------------------------

    setSidebar: sidebarOpen => this.setState({ sidebarOpen }),
    setUserList: userListOpen => this.setState({ userListOpen }),

    // --------------------------------------
    // User
    // --------------------------------------

    setUser: user => this.setState({ user }),

    setMessage: message => this.setState({ message }),

    // --------------------------------------
    // Room
    // --------------------------------------

    setRoom: room => {
      this.setState({ room, sidebarOpen: false })
      this.actions.scrollToEnd()
    },

    removeRoom: room => this.setState({ room: {} }),

    joinRoom: room => {
      this.actions.setRoom(room)
      this.actions.subscribeToRoom(room)
      this.state.messages[room.id] &&
        this.actions.setCursor(
          room.id,
          Object.keys(this.state.messages[room.id]).pop()
        )
    },

    subscribeToRoom: room =>
      
      // this.state.user.subscribeToRoom({
      //   roomId: room.id,
      //   hooks: { onMessage: this.actions.addMessage },
      // }),
      {},
    createRoom: async(options) =>
      //this.state.user.createRoom(options).then(this.actions.joinRoom),
      {
        alert('创建组:' + options.name);
        const group = new UserGroup({ name: options.name });
        const groupCreate = await group.create();

        let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const room = new Room({
          owner: JSON.parse(localStorage.getItem('blockstack-session')).userData.username,
          roomid: groupCreate._id,
          signingkeyid: groupCreate.attrs.signingKeyId,
          privatekey: groupCreate.privateKey,
          name: groupCreate.attrs.name,
          create_time: today,
          update_time: today
        });
        console.log(room);
        await room.save();

        // 保存组用户
        const roomuser = new RoomUser({
          owner: JSON.parse(localStorage.getItem('blockstack-session')).userData.username,
          roomid: groupCreate._id,
          membername: JSON.parse(localStorage.getItem('blockstack-session')).userData.username,
          create_time: today,
          update_time: today
        });
        console.log(roomuser)
        await roomuser.save()

        let tmp_roomlist = this.state.roomlist;
        tmp_roomlist.push(room);
        this.setState({
          roomlist: tmp_roomlist
        });
      },
    createConvo: options => {
      if (options.user.id !== this.state.user.id) {
        const exists = this.state.user.rooms.find(
          x =>
            x.name === options.user.id + this.state.user.id ||
            x.name === this.state.user.id + options.user.id
        )
        exists
          ? this.actions.joinRoom(exists)
          : this.actions.createRoom({
              name: this.state.user.id + options.user.id,
              addUserIds: [options.user.id],
              private: true,
            })
      }
    },

    addUserToRoom: ({ userId, roomId = this.state.room.id }) =>
      this.state.user
        .addUserToRoom({ userId, roomId })
        .then(this.actions.setRoom),

    removeUserFromRoom: ({ userId, roomId = this.state.room.id }) =>
      userId === this.state.user.id
        ? this.state.user.leaveRoom({ roomId })
        : this.state.user
            .removeUserFromRoom({ userId, roomId })
            .then(this.actions.setRoom),

    // --------------------------------------
    // Cursors
    // --------------------------------------

    setCursor: (roomId, position) =>
      this.state.user
        .setReadCursor({ roomId, position: parseInt(position) })
        .then(x => this.forceUpdate()),

    // --------------------------------------
    // Messages
    // --------------------------------------

    addMessage: payload => {
      const roomId = payload.room.id
      const messageId = payload.id
      // Update local message cache with new message
      this.setState(prevState => ({
        messages: {
          ...prevState.messages,
          [roomId]: {
            ...prevState.messages[roomId],
            [messageId]: payload
          }
        }
      }))
      // Update cursor if the message was read
      if (roomId === this.state.room.id) {
        const cursor = this.state.user.readCursor({ roomId }) || {}
        const cursorPosition = cursor.position || 0
        cursorPosition < messageId && this.actions.setCursor(roomId, messageId)
        this.actions.scrollToEnd()
      }
      // Send notification
      this.actions.showNotification(payload)
    },

    runCommand: command => {
      const commands = {
        invite: ([userId]) => this.actions.addUserToRoom({ userId }),
        remove: ([userId]) => this.actions.removeUserFromRoom({ userId }),
        leave: ([userId]) =>
          this.actions.removeUserFromRoom({ userId: this.state.user.id }),
      }
      const name = command.split(' ')[0]
      const args = command.split(' ').slice(1)
      const exec = commands[name]
      exec && exec(args).catch(console.log)
    },

    scrollToEnd: e =>
      setTimeout(() => {
        const elem = document.querySelector('#messages')
        elem && (elem.scrollTop = 100000)
      }, 0),

    // --------------------------------------
    // Typing Indicators
    // --------------------------------------

    isTyping: (room, user) =>
      this.setState(prevState => ({
        typing: {
          ...prevState.typing,
          [room.id]: {
            ...prevState.typing[room.id],
            [user.id]: true
          }
        }
      })),

    notTyping: (room, user) =>
      this.setState(prevState => ({
        typing: {
          ...prevState.typing,
          [room.id]: {
            ...prevState.typing[room.id],
            [user.id]: false
          }
        }
      })),

    // --------------------------------------
    // Presence
    // --------------------------------------

    setUserPresence: () => this.forceUpdate(),

    // --------------------------------------
    // Notifications
    // --------------------------------------

    showNotification: message => {
      if (
        'Notification' in window &&
        this.state.user.id &&
        this.state.user.id !== message.senderId &&
        document.visibilityState === 'hidden'
      ) {
        const notification = new Notification(
          `New Message from ${message.sender.id}`,
          {
            body: message.text,
            icon: message.sender.avatarURL,
          }
        )
        notification.addEventListener('click', e => {
          this.actions.joinRoom(message.room)
          window.focus()
        })
      }
    },
  }


  async fetchData() {

    //读取用户组
    const fetchRoomUserResult = await RoomUser.fetchList({});
      
    console.log(fetchRoomUserResult);

    let result=[];
    for(let i=0;i<fetchRoomUserResult.length;i++){
      console.log(fetchRoomUserResult[i].attrs.roomid);
      const fetchRoomResult = await Room.findOne({"roomid": fetchRoomUserResult[i].attrs.roomid})
      let tmpitem = {
        ...fetchRoomUserResult[i].attrs,
        name: fetchRoomResult.attrs.name
      }
      result.push(tmpitem);
    }

    console.log(result);
    console.log(result.length);

    if (result.length>0){
      this.setState({
        roomlist: result,
        selectedroom: result[0].name || ''
      });
    }
      


    
  }

  async componentDidMount() {
    'Notification' in window && Notification.requestPermission()
    

    ChatManager(this, JSON.parse(existingUser))

    if (userSession.isSignInPending()) {
      try {
        await userSession.handlePendingSignIn().then((userData) => {
          console.log(userData);
  
          window.history.replaceState({}, document.title, "/")
          this.setState({ userData: userData })
        });
      } catch {

      }
      
    }

    try {
      const currentUser = await User.createWithCurrentUser();
      console.log(currentUser);
    } catch {
      
    }
    

    this.fetchData()
  }

  render() {
    const {
      user,
      room,
      messages,
      typing,
      sidebarOpen,
      roomlist,
      userListOpen,
    } = this.state
    const { createRoom, createConvo, removeUserFromRoom } = this.actions

    return (
      <main>
        <aside data-open={sidebarOpen}>
          <UserHeader user={user} userSession={userSession} />
          <RoomList
            user={user}
            rooms={user.rooms}
            messages={messages}
            typing={typing}
            current={room}
            roomlist={roomlist}
            actions={this.actions}
          />
          {user.id && <CreateRoomForm submit={createRoom} />}
        </aside>
        <section>
          <RoomHeader state={this.state} actions={this.actions} />
          {room.id ? (
            <row->
              <col->
                <MessageList
                  user={user}
                  messages={messages[room.id]}
                  createConvo={createConvo}
                />
                <TypingIndicator typing={typing[room.id]} />
                <CreateMessageForm state={this.state} actions={this.actions} />
              </col->
              {userListOpen && (
                <UserList
                  room={room}
                  roomlist={roomlist}
                  current={user.id}
                  createConvo={createConvo}
                  removeUser={removeUserFromRoom}
                />
              )}
            </row->
          ) : user.id ? (
            <JoinRoomScreen />
          ) : (
            <WelcomeScreen />
          )}
        </section>
      </main>
    )
  }
}

// --------------------------------------
// Authentication
// --------------------------------------

window.localStorage.getItem('chatkit-user') &&
  !window.localStorage.getItem('chatkit-user').match(version) &&
  window.localStorage.clear()

const params = new URLSearchParams(window.location.search.slice(1))
const authCode = params.get('code')
const existingUser = window.localStorage.getItem('chatkit-user')

const githubAuthRedirect = () => {
  const client = '20cdd317000f92af12fe'
  const url = 'https://github.com/login/oauth/authorize'
  const server = 'https://chatkit-demo-server.herokuapp.com'
  const redirect = `${server}/success?url=${window.location.href.split('?')[0]}`
  window.location = `${url}?scope=user:email&client_id=${client}&redirect_uri=${redirect}`
}

ReactDOM.render(<View />, document.querySelector('#root'))
