const mongoose = require('mongoose');
const monUniqValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  projects: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Project' }],
});

userSchema.plugin(monUniqValidator);

module.exports = mongoose.model('User', userSchema);
