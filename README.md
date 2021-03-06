# TAO Barcode Scanner

![flow chart](diagram.png?raw=true)

TAO Barcode Scanner is a project that provides a react.js front end client designed to handle the tracking of attendance at events by means of barcode scans. It both serves a react.js app to the browser, and also acts as an intermediary between said client and a secondary server by making the appropriate API calls to fetch any data it needs. For a short diagram on how the react client utiltizes syncing and caching functionality, [click here](diagram2.png).

It is also capable of generating badges with the required barcodes in real-time.

Dependencies:

* Ruby 2.4.1

* Rails 5.2.0

* Yarn

* Webpacker

* httparty (gem)

* barby (gem)

* chunky_png (gem)

* pdfkit (gem)

* A modern web browser (recommendations: Chrome, Firefox, or Safari )

Installation instructions:

* Install the required Ruby version (RVM recommended)
* Install Rails and the required gems (`bundle install`).
* Install Yarn and the required packages (`yarn install`).
* Run `rails s` from the root of the project directory.
