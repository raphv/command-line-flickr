<?php
	$ascii = ' `.-~iI1ftnkKSG8R0B$@';
	$sortie = imagecreatetruecolor(80, 44);
	$imgfile = (isset($_GET['image'])) ? $_GET['image'] : 'http://farm5.static.flickr.com/4043/4200872227_46c88732d4_t.jpg'; //http://farm3.static.flickr.com/2690/4200871349_326f196b1a_m.jpg';
	$dimensions = (isset($_GET['width']) and isset($_GET['height'])) ? array($_GET['width'], $_GET['height']) : getimagesize($imgfile) ;
	if ($dimensions[0] > $dimensions[1]) {
		$largeur = 80;
		$x = 0;
		$ratio = (80/$dimensions[0]);
		$hauteur = floor(0.55*$dimensions[1]*$ratio);
		$y = 22 - floor($hauteur / 2);
	} else {
		$hauteur = 44;
		$y = 0;
		$ratio = (80/$dimensions[1]);
		$largeur = floor($dimensions[0]*$ratio);
		$x = 40 - floor($largeur / 2);
	}
	$source = imagecreatefromjpeg($imgfile);
	imagecopyresampled($sortie, $source, $x, $y, 0, 0, $largeur, $hauteur, $dimensions[0], $dimensions[1]);
	imagedestroy($source);
	$tableau = array();
	for ($y=0; $y<44; $y++) {
		$chaine = "";
		for ($x=0; $x<80; $x++) {
			$rgb = imagecolorat($sortie, $x, $y);
			$r = ($rgb >> 16) & 0xFF;
			$g = ($rgb >> 8) & 0xFF;
			$b = $rgb & 0xFF;
			$l = floor((6*$g+3*$r+$b)/122);
			$chaine .= $ascii[$l];
		}
		array_push($tableau,$chaine);
	}
	echo json_encode($tableau);
?>