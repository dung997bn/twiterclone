import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    userTo: { type: Schema.Types.ObjectId, ref: 'User' },
    userFrom: { type: Schema.Types.ObjectId, ref: 'User' },
    notificationType: String,
    opened: { type: Boolean, default: false },
    entityId: Schema.Types.ObjectId
}, { timestamps: true });

NotificationSchema.statics.insertNotification = async (userTo: mongoose.Types.ObjectId, userFrom: mongoose.Types.ObjectId,
    notificationType: String, entityId: mongoose.Types.ObjectId) => {
    var data = {
        userTo: userTo,
        userFrom: userFrom,
        notificationType: notificationType,
        entityId: entityId
    };
    await Notification.deleteOne(data).catch(error => console.log(error));
    return Notification.create(data).catch(error => console.log(error));
}


var Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;