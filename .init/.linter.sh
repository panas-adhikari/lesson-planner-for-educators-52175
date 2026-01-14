#!/bin/bash
cd /home/kavia/workspace/code-generation/lesson-planner-for-educators-52175/course_planner_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

