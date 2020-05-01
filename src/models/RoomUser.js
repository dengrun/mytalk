import { Model } from 'radiks';

export default class RoomUser extends Model {
  static className = 'RoomUser';

  static schema = {
    owner: String,            //所有者
    roomid: String,           //组ID
    membername: {             //组成员
      type: String,
      decrypted: true
    },       
    create_time: {            //创建时间
      type: String,
      decrypted: true
    },
    update_time: {            //最后更新时间
      type: String,
      decrypted: true
    }
  }
}