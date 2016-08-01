// RCOMMAND PAR R@ph_V -- A BESOIN DE JQUERY POUR FONCTIONNER

var RC_LARGEUR = "80";
var RC_HAUTEUR = "48";
var RC_CLASSE_LIGNE = "ligne";
var RC_NOMDIV_LIGNES = "lignes";
var RC_NOMDIV_INVITE = "lignefin";
var RC_NOMDIV_ENTREE = 'entree';
var RC_INTERVALLE = 50;

var RC_LIGNES = new Array();
var RC_COMMANDES = new Array();

function Commande(nom_commande, fonction_executer, chaines_aide) {
	this.nom = nom_commande;
	this.fonction = fonction_executer;
	this.aide = chaines_aide;
}

function rc_ajout_commande(nom_commande, fonction_executer, chaines_aide) {
	RC_COMMANDES.push(new Commande(nom_commande, fonction_executer, chaines_aide));
}

function rc_interprete() {
	var ligne = $('#'+RC_NOMDIV_ENTREE).val();
	$('#'+RC_NOMDIV_ENTREE).val("");
	rc_ecrire_lignes(["command > "+ligne,""]);
	ligne = ligne.replace("&","&amp;")
	var tableau = ligne.split(" ");
	if (tableau.length > 0) {
		var trouve = false;
		if (RC_COMMANDES.length > 0) {
			for (var i=0; i<RC_COMMANDES.length; i++) {
				if (RC_COMMANDES[i].nom == tableau[0]) {
					trouve = true;
					RC_COMMANDES[i].fonction(tableau);
					break;
				}
			}
		}
		if (!trouve) {
			rc_ecrire_lignes(["Unknown command. Type 'help' to list available commands.",""]);
		}
	}
}

function rc_ecrire_lignes(tableau) {
	RC_LIGNES = RC_LIGNES.concat(tableau);
}

function rc_traite_ligne(ligne) {
	sortie = "";
	if (ligne.length > 0) {
		for (var i=0; i<Math.min(ligne.length, RC_LARGEUR); i++) {
			var ascii = ligne.charCodeAt(i);
			if ((ascii < 32) || (ascii > 127)) { ascii = 63; }
			sortie += '<img src="images/chr' + ascii + '.gif" width="6" height="11" />'; 
		}
	}
	return sortie;
}

function rc_affiche_ligne() {
		if (RC_LIGNES.length > 0) {
		$("."+RC_CLASSE_LIGNE+":first").remove();
		$("#"+RC_NOMDIV_LIGNES).append('<div class="'+RC_CLASSE_LIGNE+'">' + rc_traite_ligne(RC_LIGNES[0]) + '</div>');
		RC_LIGNES.splice(0,1);
	}
}

function rc_initialise() {
	var lignaff = new Array();
	for(var i=0;i<RC_HAUTEUR;i++) {
		lignaff.push('<div class="'+RC_CLASSE_LIGNE+'"></div>');
	}
	$("#"+RC_NOMDIV_LIGNES).html(lignaff.join(""));
	$("#"+RC_NOMDIV_INVITE).html(rc_traite_ligne("command >"));
	document.getElementById(RC_NOMDIV_ENTREE).focus();
	window.setInterval(rc_affiche_ligne,RC_INTERVALLE);
}

for(var i=32; i<127; i++) {
	var nimg = new Image();
	nimg.src = "images/chr"+i+".gif";
}
rc_ajout_commande("help", function(tableau) {
	if (tableau.length > 1) {
		var trouve = false;
		for (var i=0; i<RC_COMMANDES.length; i++) {
			if (RC_COMMANDES[i].nom == tableau[1]) {
				trouve = true;
				rc_ecrire_lignes(RC_COMMANDES[i].aide);
				rc_ecrire_lignes(['']);
				break;
			}
		}
		if (!trouve) {
			rc_ecrire_lignes(["Unknown command. Type 'help' to list available commands.",""]);
		}
	} else {
		var chaines = new Array();
		chaines.push("List of available commands :");
		chaines.push("  ");
		var pos_chaine = 1;
		for (var  i=0; i<RC_COMMANDES.length; i++) {
			if ((chaines[pos_chaine].length+RC_COMMANDES[i].nom.length+3) > RC_LARGEUR) {
				chaines.push("   '"+RC_COMMANDES[i].nom+"'");
				pos_chaine++;
				
			} else {
				chaines[pos_chaine] += " '"+RC_COMMANDES[i].nom+"'";
			}
		}
		rc_ecrire_lignes(chaines);
		rc_ecrire_lignes(["",
			"Type 'help <command name> for more specific help about each command",
			"Example : Typing 'help list' will display help about the 'list' command",
			""]);
	}
}, ["This is help about help !"]
);
