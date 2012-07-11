package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.Logger
import views._
import models._

object SignUp extends Controller {

  val signupForm = Form(
    mapping(
      "email" -> email,
      "feedback" -> optional(text)
    )(User.apply)(User.unapply)
  )
     
  def form = Action {
    Ok(html.signup.form(signupForm));
  }
  
  def submit = Action { implicit request =>
    signupForm.bindFromRequest.fold(
      errors => BadRequest(html.signup.form(errors)),
      user => {
		Users.create(user)	
		Logger.info(user.toString)
		Ok(html.signup.summary())
	  }
    )
  }
  
}
