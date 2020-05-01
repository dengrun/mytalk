import { Model } from 'radiks';

export default class Room extends Model {
  static className = 'Room';

  static schema = {
    owner: String,            //所有者
    roomid: {                //组ID
      type: String,
      decrypted: true
    },          
    signingkeyid: String,
    privatekey: String,
    name: String,             //组名称
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