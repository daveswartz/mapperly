# Mapperly

Mapperly is a simple + interactive map of the New York City subway. 

Built using d3.js as a static page. The project is hosted on [GitHub Pages](https://daveswartz.github.io/mapperly/).

![Mapperly](https://raw.github.com/daveswartz/mapperly/master/mapperly.png)

## Getting Started

* In the project root run: `python3 -m http.server`;
* Navigate to [http://localhost:8000](http://localhost:8000) in your web browser.

## Data

The station and line data has not been updated since 2013. It does not include 34 St - Hudson Yards (2015), the W (restored 2016) or the Second Avenue Subway (2017).

* `assets/data/paths.json` -- GeoJson file that stores the path of each subway line.
* `assets/data/stops.json` -- GeoJson file that stores the location and name of each subway stop.
* `assets/data/transfers.json` -- GeoJson file that stores the location and name of each subway transfer.

## Copyright and license

Copyright 2012 David Swartz

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.