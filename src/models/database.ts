import type { ObjectId } from "mongodb";

// note: added "Document" after each interface name to prevent confusion with other 
// interfaces e.g. User which will store info frontend requires about logged-in user

export interface UserDocument {
  _id: ObjectId // user's ID
  fullName: string // user's full name
  email: string // user's email
  password: string // user's password
  admin: boolean // holds whether or not a user is an admin
}

export interface AnimalDocument {
  _id: ObjectId // animal's ID
  name: string // animal's name
  breed: string // animal's breed
  owner: ObjectId // id of the animal's owner
  hoursTrained: number // total number of hours the animal has been trained for
  profilePicture: string // url to an image that can be displayed in an <img> tag
}

export interface TrainingLogDocument {
  _id: ObjectId // training log's id
  user: ObjectId // user this training log corresponds to
  animal: ObjectId // animal this training log corresponds to
  title: string // title of training log
  date: Date // date of training log
  description: string // description of training log
  hours: number // number of hours the training log records
}
