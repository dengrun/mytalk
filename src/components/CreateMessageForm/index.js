import React from 'react'
import style from './index.module.css'
import { FileInput } from '../FileInput'

export const CreateMessageForm = ({
  state: { user = {}, room = {}, message = '' },
  actions: { runCommand },
}) => {

  return (
    room.id ? (
      <form
        className={style.component}
        onSubmit={e => {
          e.preventDefault()

          const message = e.target[0].value.trim()

          if (message.length === 0) {
            return
          }

          e.target[0].value = ''

          // message.startsWith('/')
          //   ? runCommand(message.slice(1))
          //   : user.sendMessage({
          //       text: message,
          //       roomId: room.id,
          //     })
          message.startsWith('/')
            ? runCommand(message.slice(1))
            : alert('发送消息:' + message)
        }}
      >
        <input
          placeholder="Type a Message.."
        />
        <FileInput state={{ user, room, message }} />
        <button type="submit">
          <svg>
            <use xlinkHref="index.svg#send" />
          </svg>
        </button>
      </form>
    ) : null
  )
}
