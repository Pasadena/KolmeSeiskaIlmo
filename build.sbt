import GruntHook._
import play.PlayImport.PlayKeys.playRunHooks

name := """KolmeSeiskaIlmo"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  ws,
  "com.typesafe.slick" %% "slick" % "2.1.0",
  "com.typesafe.play" %% "play-slick" % "0.8.0",
  "org.webjars" 			%% 	"webjars-play" 				% "2.3.0",
  "org.webjars" % "bootstrap" % "3.0.0",
  "org.webjars" % "jquery-ui" % "1.11.2",
  "org.webjars" % "jquery-ui-themes" % "1.11.2"
)

playRunHooks <+= baseDirectory.map(base => GruntHook(base))
