// COMMAND LINE FLICKR PAR R@ph_V - A BESOIN DE RCOMMAND ET JQUERY POUR FONCTIONNER

var CLF_URL_API = 'https://api.flickr.com/services/rest/';
var CLF_API_KEY = '74d94be50a0430dc75749889e61d03ab';
var CLF_EXTRAS_RECH = "&per_page=36&extras=owner_name,date_taken,url_t,tags,license"
var CLF_LICENCES = [
	"All Rights Reserved",
	"Attribution-NonCommercial-ShareAlike License",
	"Attribution-NonCommercial License",
	"Attribution-NonCommercial-NoDerivs License",
	"Attribution License",
	"Attribution-ShareAlike License",
	"Attribution-NoDerivs License",
	"No known copyright restrictions",
	"United States Government Work" ];

var CLF_LISTE = null;
var CLF_NOM_LISTE = "No photo list loaded";
var CLF_TMP_NOM_LISTE = "";
var CLF_POSITION_PHOTO = -1;

function clf_erreur_api(donnees) {
	rc_ecrire_lignes(["Flickr API Error :","   "+donnees.message,""]);
}

function clf_erreur_no_list() {
	rc_ecrire_lignes(["No photo list loaded... Use one of the following commands to load a list :","  'recent' 'tags' 'user'", ""]);
}

function clf_erreur_no_photo() {
	rc_ecrire_lignes(["No photo selected... Type 'view' or 'info' followed by a photo number", ""]);
}

function clf_req_flickr(methode, donnees, callback) {
	var url = CLF_URL_API + '?method=' + methode + '&api_key=' + CLF_API_KEY + "&format=json&jsoncallback=?" + donnees;
	$.getJSON(url, callback);
}

function clf_get_userid(utilisateur, callback) {
	if (utilisateur.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
		var methode = "flickr.people.findByEmail";
		var arguments = "&find_email="+utilisateur;
	} else {
		var methode = "flickr.people.findByUsername";
		var arguments = "&username="+utilisateur;
	}
	clf_req_flickr(methode, arguments, function(donnees) {
		if (donnees.stat == "ok") {
			callback(donnees.user.id);
		} else {
			clf_erreur_api(donnees);
		}
	});
}

function clf_get_recent() {
	CLF_TMP_NOM_LISTE = "Recent uploads from all users";
	clf_req_flickr("flickr.photos.getRecent", CLF_EXTRAS_RECH, clf_resultats_recherche);
}

function clf_recherche_tags(tableau) {
	if (tableau.length > 1) {
		CLF_TMP_NOM_LISTE = "Photos tagged with "+tableau.slice(1).join(" and ");
		clf_req_flickr("flickr.photos.search", "&tags="+encodeURIComponent(tableau.slice(1).join(","))+CLF_EXTRAS_RECH, clf_resultats_recherche);
	} else {
		rc_ecrire_lignes(["Please enter at least one tag, e.g. 'tags cat'",""]);
	}
}

function clf_recherche_utilisateur(tableau) {
	if (tableau.length > 1) {
		clf_get_userid(tableau.slice(1).join(" "), function(userid) {
			CLF_TMP_NOM_LISTE = "Photos uploaded by "+tableau.slice(1).join(" ");
			clf_req_flickr("flickr.photos.search", "&user_id="+encodeURIComponent(userid)+CLF_EXTRAS_RECH, clf_resultats_recherche);
		});
	} else {
		rc_ecrire_lignes(["Please enter a username or e-mail, e.g. 'user raph.v' or 'user raph.velt@gmail.com'",""]);
	}
}

function clf_resultats_recherche(donnees) {
	if (donnees.stat == "ok") {
		CLF_LISTE = donnees.photos.photo;
		CLF_NOM_LISTE = CLF_TMP_NOM_LISTE;
		CLF_POSITION_PHOTO = -1;
		clf_lister();
	} else {
		clf_erreur_api(donnees);
	}
}

function clf_lister() {
	if (CLF_LISTE) {
		var blanc = "";
		for (i=0; i<35; i++) { blanc += " "; }
		rc_ecrire_lignes([CLF_NOM_LISTE +" - " + CLF_LISTE.length + " search results :", "",
		"index title                               author                      date taken",
		"----- ----------------------------------- --------------------------- ----------"]);
		$.each(CLF_LISTE, function(index, element) {
			var chaine = ((CLF_POSITION_PHOTO == index) ? ">" : " ") + "[" + ((index < 9) ? " " : "") + (index+1) + "] ";
			var colonne = element.title + blanc;
			chaine += colonne.substr(0,35)+ " ";
			colonne = element.ownername + blanc;
			chaine += colonne.substr(0,27)+ " ";
			chaine += element.datetaken.substr(0,10);
			rc_ecrire_lignes([chaine]);
		});
		rc_ecrire_lignes(["----- ----------------------------------- --------------------------- ----------",
		"",
		"Hints >   Display information about a photo by typing 'info <photo number>'",
		"          Render a photo as ASCII Art by typing 'view <photo number>'",
		"          Load a new list with the 'recent', 'tags' and 'user' commands",
		"          Get help at any moment by just typing 'help'", ""]);
	} else {
		clf_erreur_no_list();
	}
}

function clf_visionner(tableau) {
	var photo = clf_selection_photo(tableau);
	if (photo) {
		rc_ecrire_lignes(["    ... and rendering it as ASCII Art",""]);
		$.getJSON("asciize.php?image="+photo.url_t+"&width="+photo.width_t+"&height="+photo.height_t, function(donnees) {
			rc_ecrire_lignes(donnees);
			rc_ecrire_lignes(["Photo : '"+photo.title.substr(0,35)+"' by '"+photo.ownername.substr(0,20)+"' taken on '"+photo.datetaken.substr(0,10)+"'",
			"Hints >   Display more information about this photo by typing 'info'",
			"          View next photo by typing 'view next' or previous with 'view prev'", ""]);
		});
	}
}

function clf_information(tableau) {
	var photo = clf_selection_photo(tableau);
	if (photo) {
		rc_ecrire_lignes([
		"--------------------------------------------------------------------------------",
		"Title      : "+photo.title,
		"User       : "+photo.ownername,
		"Date taken : "+photo.datetaken,
		"Tags       : "+photo.tags,
		"License    : "+CLF_LICENCES[photo.license],
		"URL        : flickr.com/photos/"+photo.owner+"/"+photo.id,
		"--------------------------------------------------------------------------------",
		"",
		"Hints >   Render this photo as ASCII Art by typing 'view'",
		"          Display information about next photo by typing 'info next'",
		"          Or go back to the previous one with 'info prev'",
		"          Display the photo list again by typing 'list'",
		"          Or load a new list with the 'recent', 'tags' and 'user' commands",
		""
		]);
	}
}

function clf_selection_photo(tableau) {
	if (CLF_LISTE&&(CLF_LISTE.length > 0)) {
		var c_est_bon = false;
		if (tableau.length > 1) {
			if (parseInt(tableau[1])) {
				if (CLF_LISTE[(tableau[1]-1)]) {
					CLF_POSITION_PHOTO = (tableau[1]-1);
					c_est_bon = true;
				} else {
					rc_ecrire_lignes(["Error : There is no photo at index " + tableau[1],""]);
				}
			} else {
				switch(tableau[1]) {
				case "prev":
					if (CLF_POSITION_PHOTO == -1) {
						clf_erreur_no_photo();
					} else {
	    				CLF_POSITION_PHOTO = (CLF_POSITION_PHOTO == 0) ? CLF_LISTE.length - 1 : CLF_POSITION_PHOTO - 1;
						c_est_bon = true;
					}
				break;
				case "next":
					if (CLF_POSITION_PHOTO == -1) {
						clf_erreur_no_photo();
					}
					else {
						CLF_POSITION_PHOTO = (CLF_POSITION_PHOTO == CLF_LISTE.length - 1) ? 0 : CLF_POSITION_PHOTO + 1;
						c_est_bon = true;
					}
				break;
				default: 
					rc_ecrire_lignes(["Error: Command unknown."]);
				}
			}
		} else {
			if (CLF_POSITION_PHOTO == -1) {
				clf_erreur_no_photo();
			} else {
				c_est_bon = true;
			}
		}
		if (c_est_bon) {
			rc_ecrire_lignes(["Loading photo "+(CLF_POSITION_PHOTO+1)+"/"+CLF_LISTE.length]);
			return CLF_LISTE[CLF_POSITION_PHOTO];
		} else {
			return false;
		}
	} else {
		clf_erreur_no_list();
		return null;
	}
}

function clf_initialise() {
	rc_ecrire_lignes([
		'  _    _ ___ __    __  __ __  __ ___    ____ __  ',
		' ( \\/\\/ )  _)  )  / _)/  \\  \\/  )  _)  (_  _)  \\ ',
		'  \\    / ) _))(__( (_( () )    ( ) _)    )(( () )',
		'   \\/\\/ (___)____)\\__)\\__/_/\\/\\_)___)   (__)\\__/ ',
		'',
		'                                                            _                 ',
		'                                                   |       | | o              ',
		'   __   __   _  _  _    _  _  _    __,   _  _    __|       | |     _  _    _  ',
		'  /    /  \\_/ |/ |/ |  / |/ |/ |  /  |  / |/ |  /  |  ---  |/  |  / |/ |  |/  ',
		'  \\___/\\__/   |  |  |_/  |  |  |_/\\_/|_/  |  |_/\\_/|_/     |__/|_/  |  |_/|__/',
		'', '', '',
		'                       _/_/_/_/  _/        _/_/_/    _/_/_/  _/    _/  _/_/_/',
		'                      _/        _/          _/    _/        _/  _/    _/    _/',
		'                     _/_/_/    _/          _/    _/        _/_/      _/_/_/',
		'                    _/        _/          _/    _/        _/  _/    _/    _/',
		'                   _/        _/_/_/_/  _/_/_/    _/_/_/  _/    _/  _/    _/',
		'', '', '',
		'                A tribute to Bulletin Board Systems and ASCII art', '',
		'            version 0.2.4 - On the interwebs since December 26, 2009', '',
		'                      Created by R@ph_V - http://velt.info/', '', '',
		'Hints > You should start by loading a list of photos',
		"        Type 'recent' to list recent uploads from all users !",
		"        Type 'tags' followed by keywords to get a list photos tagged with these",
		"        keywords (for example: 'tags cute cat')",
		"        Type 'user' followed by a Flickr user's name or e-mail to display photos",
		"        uploaded by that user (for example: 'user raph.v')",
		"        Get help at any moment by typing the very useful 'help' command !",
		""]);
}

rc_ajout_commande("recent",clf_get_recent,[
	"Loads a list of recent uploads from all users"]);
rc_ajout_commande("tags",clf_recherche_tags,[
	"Loads a list of photos tagged with keywords",
	"Examples: 'tags dog', 'tags cute cat'"]);
rc_ajout_commande("user",clf_recherche_utilisateur,[
	"Loads a list of photos uploaded by an user",
	"Examples: 'user raph.v' or 'user raph.velt@gmail.com'"]);
rc_ajout_commande("list",clf_lister,[
	"Displays the currently loaded photo list"]);
rc_ajout_commande("view",clf_visionner,[
	"Renders a photo as ASCII art !!!",
	"Examples: 'view' with no argument displays the currently selected photo",
	"          'view 5' displays photo numbered 5 in the list",
	"          'view next' displays the photo following the selected one",
	"          'view prev' displays the photo before the selected one"]);
rc_ajout_commande("info",clf_information,[
	"Displays detailed information about a photo",
	"Examples: 'view' with no argument displays the currently selected photo",
	"          'view 5' displays photo numbered 5 in the list",
	"          'view next' displays the photo following the selected one",
	"          'view prev' displays the photo before the selected one"]);
