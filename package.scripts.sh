#!/bin/sh -e

BuildEnv() {
  #
  # Build the application environment.
  #
  # Usage:
  #   BuildEnv
  #

  DIR="src/config"
  FM_FILE="$DIR/build.env.template.ts"
  TO_FILE="$DIR/build.env.ts"

  if [ ! -e $TO_FILE ]; then
    cp $FM_FILE $TO_FILE
  fi
}
