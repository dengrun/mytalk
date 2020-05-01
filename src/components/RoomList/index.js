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
  roomlist = [],
  actions,
}) => (
  <ul className={style.component}>
    {roomlist.map(room => {

      const order = 3
      const unreadCount = 5
      return (
        <li
          key={room.id}
          disabled={room.id === current.id}
          onClick={e => actions.joinRoom(room)}
          style={{ order }}
        >
          { (
            Icon('public')
          )}
          <col->
            <p>{room.name}</p>
            <span></span>
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
