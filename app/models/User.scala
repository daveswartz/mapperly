package models

import util.Properties
import com.novus.salat._
import com.novus.salat.global._
import com.mongodb.casbah.Imports._

case class User(
  email: Option[String],
  feedback: String
)

object Users {
  val usersColl = Properties.envOrNone("MONGOLAB_URI").flatMap { uriString =>    
    val uri = MongoClientURI(uriString)
    val mongoClient = MongoClient(uri)
    uri.database.map { dbString => 
      val db = mongoClient(dbString)      
      db("users")
    }
  }

  def create(user: User) {
    usersColl.map(_ += grater[User].asDBObject(user))
  }
}
