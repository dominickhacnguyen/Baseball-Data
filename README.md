# Summary
A CSV dataset of baseball players and their characteristics and statistics was parsed and an interactive data visualization was created using common web development languages (HTML5, CSS3, JavasScript) and the D3 library. The focus of this visualization was handedness of the player.
# Data Cleaning
We cleaned the original dataset of 1157 baseball players (stored in baseball_data.csv) by removing any players that did not score a homerun or have a batting average. To expedite the cleaning process, these players were removed directly with Excel. This new dataset contains 871 players and is stored in baseball_data2.csv.
# Design
## Visual Encoding
The most important fields, the two performance indicators (batting avg and home runs hit), are encoded by x position and y position respectively. Since handedness is the variable that we wish to show a difference in, we encoded this through color for easy comparison. Additionally, we made this variable interactive by allowing the user to sort the data by handedness through interacting with the buttons on the right side. Clicking on these buttons highlights visual elements that pertain to that hand type.
## Scatter Plot
We decided to use a large scatter plot to allow the user to see trends in the data and interact with it to find their own data story. The data points on the scatter plot allow for additional user interaction by displaying the player’s information in a statistics-like tooltip upon hovering and clicking.
## Bar Charts
After some feedback, we also added a ‘summary statistics’ portion for quick explanatory visualization while retaining exploratory functionality with the whole dataset. Bar charts were used to allow quick comparison. The visual encoding of handedness is color to be consistent with the scatter plot. No axes were used as bar width and values in the bars were sufficient to encode the data and the colors were sufficient to encode the handedness.
# Feedback
The visualization was updated based on collected feedback. Version 1.0 represents the visualization before the feedback and Version 2.0 represents the visualization after the feedback. 
Please note, only Version 2.0 can be seen in the browser via the link: https://dominickhacnguyen.github.io/baseball-data/. Version 1.0 can be viewed by downloading it separately and viewing it locally. 
Below is the feedback that was collected:
-	Brother noticed that there were two circles that would show up green (left handed) even though the red (right handed) button was selected. Refer to Version1.0_Issue.jpg.
> - To resolve this, we went back to the csv file and found out that there were duplicates in the name field. 
> -	Initially, we had assumed that the ‘name’ field was unique and bound the filtered data to the data circles with the name field in the ‘key’ function. However, upon further analysis of the data in Excel, we found two data points that had the same name to another data point. 
> -	Thus, to rectify this, we added an ‘id’ field and put a unique value for each record.
-	Mother mentioned the selected toggle button for handedness should be emphasized when the data is changed. 
> -	Therefore, we highlighted the selected button by increasing its opacity and fading the unselected buttons. 
-	Father noted that while the visualization was brilliant and clean, it was difficult to determine relationships by showing the whole dataset. 
> -	Taking this feedback, we added a ‘summary statistics’ segment to compare player characteristics on performance statistics.
# Resources
- https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
- http://bl.ocks.org/d3noob/5d621a60e2d1d02086bf
- http://bl.ocks.org/weiglemc/6185069 
- https://bl.ocks.org/mbostock/7322386 
