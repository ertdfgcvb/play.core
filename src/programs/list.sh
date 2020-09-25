#!/bin/bash

# Script to generate a list of all the projects

SCRIPT_PATH=${0%/*}    # path to this script

URL_PREFIX='/#/src'

# All folders
#FOLDERS=`find ./ -mindepth 1 -type d`

# Odered list of folders
FOLDERS=(basics sdf demos camera contributed)


for folder in ${FOLDERS[@]}; do

	FIRST=1

	for file in $SCRIPT_PATH/$folder/*.js; do

		URL=$URL_PREFIX$(echo $file | sed -e 's/\.\///g' -e 's/\.js//g')
		AUTHOR=$(sed -En 's/^@author[ \t](.*)$/\1/p' $file)
		TITLE=$(sed -En 's/^@title[ \t](.*)$/\1/p' $file)
		DESC=$(sed -En 's/^@desc[ \t](.*)$/\1/p' $file)
		if [[ $FIRST == 1 ]]; then
			FOLDER=$(echo $folder | sed -e 's/\.\///g' -e 's/\///g' -e 's/\.js//g' )
			FIRST=0
			printf "\t"
			printf "<div>"
			printf "$FOLDER"
			printf "</div>"
			printf "\n"
		else
			printf "\t"
			printf "<div>"
			printf "</div>"
			printf "\n"
		fi

		printf "\t"
		printf "<div>"
		printf "<a target='_blank' href='$URL'>$TITLE</a>"
		printf "</div>"
		printf "\n"

		printf "\t"
		printf "<div>"
		printf "$DESC"
		printf "</div>"
		printf "\n"

	done
done
