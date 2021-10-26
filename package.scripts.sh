#!/bin/sh -e

SERVER_DIR="./server"
FM_DB_FILE="$SERVER_DIR/db.origin.json"
TO_DB_FILE="$SERVER_DIR/db.json"

SetupDB() {
  if [ ! -e "$TO_DB_FILE" ]; then
    cp "$FM_DB_FILE" "$TO_DB_FILE"
  fi
}

RevertDB() {
  cp -f "$FM_DB_FILE" "$TO_DB_FILE"
}
