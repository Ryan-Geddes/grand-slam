https://www.youtube.com/watch?v=BQrQMW3tQSU

https://en.wikipedia.org/wiki/Haversine_formula

https://en.wikipedia.org/wiki/Vincenty%27s_formulae

https://www.movable-type.co.uk/scripts/latlong.html

https://stackoverflow.com/questions/17654806/determining-if-an-object-is-moving-away-from-a-point-versus-towards-it

I am trying to practice my skills with using latitude and longitude and I'm attempting to determine the following: given a center point X on a map and a point around it called Y, how do I tell whether or not the points around the center are moving away from the center object or towards it using latitude and longitude?

Right now I have the center latitude and longitude and am focusing on one of the points around it. I have used the Haversine method to calculate distance in miles between two lats and longs. Using this I measured the initial distance the from X to Y and assigned it to a variable. Upon Y's first move I recalculated the overall distance from X to Y and compared it with the initial. If the new measurement is greater than the old then your distance from the point X is increasing, if not it's decreasing. Also, I have check to make sure what I'm working with the point Y is ACTUALLY moving some distance with each move, not just going around the radius of point X in some weird fashion.

Is the way I'm doing things sound alright? I keep feeling like I need to fine tune something but I just can't put my finger on it.

Hopefully everything I'm saying makes sense and is not falling on deaf ears and this doesn't get flagged as an non-constructive question. It definitely is.

https://www.youtube.com/watch?v=TOTlkKMjQfw


//AUDIO:

How to prevent song playing over itself, use a playing state var:
https://stackoverflow.com/questions/60358506/i-cant-use-the-audio-sound-from-expo-instance-correctly-i-cant-pause-or-updat

//setInterval shenanigans:

https://blog.davidvassallo.me/2020/04/09/react-hooks-and-setinterval/