<!DOCTYPE html>
<html>
	<head>
		<title>The Flag Party</title>
		<link rel="stylesheet" type="text/css" href="./css/main.css">
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
		<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
		<link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png">
		<link rel="manifest" href="/manifest.json">
		<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ff1515">
		<meta name="theme-color" content="#e10000">
	</head>
	<body>
		<script type="text/javascript">
		window.onbeforeunload = function () {
		  window.scrollTo(0, 0);
		}
		</script>
		<div id="navbar">
			<a id="logolnk" href="http://www.flagparty.org"></a>
			<img id="logo" width="75px" height="75px" src="./images/logo.png">
			<div id="btnsLeft">
				<a href="about.php" class="navbtn">About</a>
				<a href="platform.php" class="navbtn">Platform</a>
			</div>
			<!-- IMPORTANT  GET
			RID
			OF
			FILE
			EXTENSIONS
			IN
			.HTACCESS
			-->
			<div id="btnsRight">
				<a href="news.php" class="navbtn">News</a>
				<a href="elections.php" class="navbtn">Elections</a>
			</div>
			<div id="socialmedia">
				<!-- Twitter --><a href="https://www.twitter.com/FlagPartyUSA"><img src="./images/social/twitter.png" class="socialmediaicon"></a>
				<!-- Facebook --><a href="https://www.facebook.com/FlagPartyUSA"><img src="./images/social/facebook.png" class="socialmediaicon"></a>
				<!-- Instagram --><a href="https://www.instagram.com/flagpartyusa/"><img src="./images/social/instagram.png" class="socialmediaicon"></a>
				<!-- Google+ --><a href="https://aboutme.google.com/b/101072737346920572449/"><img src="./images/social/google.png" class="socialmediaicon"></a>
				<!-- Youtube --><a href="https://www.youtube.com/channel/UCyI-njp2tt589Hgg_MDG1Lw"><img src="./images/social/youtube.png" class="socialmediaicon"></a>
			</div>
			<a href="./donate.php" id="donate">Donate</a>
		</div>
		<div id="slideshow">
			<div class="bdiv"></div>
			<div id="sstext">
				The flag is sacred.
			</div>
			<div id="hereswhydiv">
				<a class="hybtn" id="hereswhy" href="javascript:void(0)">Here's why</a>
			</div>
		</div>
		<div id="theflag">
			<div class="textPieces">
				<span class="heading">The flag is a symbol of LIBERTY</span><br><br>
				<p class="para">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><br><br>
				<a href="javascript:void(0)" id="downArrow1" class="downArrow"><img class="downArrow" src="./images/downArrow.png"></a>
			</div>
		</div>
		<div id="theflag2">
			<div class="textPieces">
				<span class="heading">The flag is a symbol of UNITY</span><br><br>
				<p class="para">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><br><br>
				<a href="javascript:void(0)" id="downArrow2" class="downArrow"><img class="downArrow" src="./images/downArrow.png"></a>
			</div>
		</div>
		<div id="theflag3">
			<div class="textPieces">
				<span class="heading">The flag is a symbol of TENACITY</span><br><br>
				<p class="para">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><br><br>
				<a href="javascript:void(0)" id="upArrow" class="downArrow"><img class="downArrow" src="./images/upArrow.png"></a><span id="btt">Back to top</span>
			</div>
		</div>
		<div id="footer">
		ur fukt
		</div>
		<script type="text/javascript">
		var scrolled = false;
		$(window).on('scroll', function () { 
			if (!scrolled) {
				// Preventing default action of the event
				//event.preventDefault();
				// Getting the height of the document
				var n = $(document).height();
				$('html, body').animate({ scrollTop: ($(window).height() - 115) }, 500);
				scrolled = true;
			} else if ($(window).scrollTop() == 0) {
				scrolled = false;
			} else {
				return true;
			}
		});
		
		$('.hybtn').click(function(event) {
			// Preventing default action of the event
			//event.preventDefault();
			// Getting the height of the document
			var n = $(document).height();
			$('html, body').animate({ scrollTop: ($(window).height() - 115) }, 500);
		//                                       |    |
		//                                       |    --- duration (milliseconds) 
		//                                       ---- distance from the top
		});
		
		$('#downArrow1').click(function(event) {
			// Preventing default action of the event
			//event.preventDefault();
			// Getting the height of the document
			var n = $(document).height();
			$('html, body').animate({ scrollTop: (($(window).height() * 2) - 115) }, 500);
		//                                       |    |
		//                                       |    --- duration (milliseconds) 
		//                                       ---- distance from the top
		});
		
		$('#downArrow2').click(function(event) {
			// Preventing default action of the event
			//event.preventDefault();
			// Getting the height of the document
			var n = $(document).height();
			$('html, body').animate({ scrollTop: (($(window).height() * 3) - 115) }, 500);
		//                                       |    |
		//                                       |    --- duration (milliseconds) 
		//                                       ---- distance from the top
		});
		
		$('#upArrow').click(function(event) {
			// Preventing default action of the event
			//event.preventDefault();
			// Getting the height of the document
			var n = $(document).height();
			$('html, body').animate({ scrollTop: 0 }, 500);
		//                                       |    |
		//                                       |    --- duration (milliseconds) 
		//                                       ---- distance from the top
		});
		</script>
	</body>
</html>