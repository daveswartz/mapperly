package models

import util.Properties
import com.novus.salat._
import com.novus.salat.global._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.{MongoURI, MongoConnection}

case class User(
  email: String, 
  feedback: Option[String]
)

object Users {
  val mongolabUri = Properties.envOrNone("MONGOLAB_URI")
  val uri = MongoURI(mongolabUri.get)
  val mongo = MongoConnection(uri)
  val db = mongo(uri.database)
  db.authenticate(uri.username, uri.password.foldLeft("")(_ + _.toString))
  val users = db("users")

  def create(user: User) {
    users += grater[User].asDBObject(user)
  }
}
