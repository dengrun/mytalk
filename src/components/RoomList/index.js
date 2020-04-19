import React from 'react'
import style from './index.module.css'
import { dots } from '../TypingIndicator/index.module.css'

const Icon = id => (
  <svg>
    <use xlinkHref={`index.svg#${id}`} />
  </svg>
)

export const RoomList = ({
  rooms = [],
  user,
  messages,
  current,
  typing,
  actions,
}) => (
  <ul className={style.component}>
    {rooms.map(room => {
      const messageKeys = Object.keys(messages[room.id] || {})
      const latestMessage =
        messageKeys.length > 0 && messages[room.id][messageKeys.pop()]
      const firstUser = room.users.find(x => x.id !== user.id)
      const order = 3
      const unreadCount = 5
      return (
        <li
          key={room.id}
          disabled={room.id === current.id}
          onClick={e => actions.joinRoom(room)}
          style={{ order }}
        >
          {room.name.match(user.id) && firstUser ? (
            <img src={firstUser.avatarURL} alt={firstUser.id} />
          ) : (
            Icon(room.isPrivate ? 'lock' : 'public')
          )}
          <col->
            <p>{room.name.replace(user.id, '')}</p>
            <span>{latestMessage && latestMessage.text}</span>
          </col->
          {room.id !== current.id && unreadCount ? (
            <label>{unreadCount}</label>
          ) : Object.keys(typing[room.id] || {}).length > 0 ? (
            <div className={dots}>
              {[0, 1, 2].map(x => (
                <div key={x} />
              ))}
            </div>
          ) : null}
        </li>
      )
    })}
  </ul>
)
