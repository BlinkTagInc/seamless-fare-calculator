# Seamless Fare Zone Calculator

https://fares.seamlessbayarea.org

KML farezone map http://drive.google.com/open?id=14WTpyPps8MahFfafOqzMsQBDbA550Lgi&usp=sharing_eip

Zone fare matrix https://docs.google.com/spreadsheets/d/1RvwU0NG7zseZTqbZ2MX3gtYJ7PoJ-h06hFhaWp6_8Vc/edit#gid=0

## Generating geojson from KML

togeojson farezones.kml > farezones.json

## Generating farezones_matrix.json

    cd data/farezone_calcs

    npm install

    node index.js

Review `data/farezone_calcs/farezones_matrix.json` to ensure it looks ok, then copy it to `/data`  directory

    cp data/farezone_calcs/farezones_matrix.json data/farezones_matrix.json
