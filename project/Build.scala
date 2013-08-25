import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

    val appName = "Mapperly"
    val appVersion = "0.1-SNAPSHOT"

	val appDependencies = Seq(
	  "com.novus" %% "salat" % "1.9.2"
	)

	val main = play.Project(appName, appVersion, appDependencies).settings()

}
