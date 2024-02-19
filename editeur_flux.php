<?php
function alert($msg) {
    echo "<script type='text/javascript'>alert('$msg');</script>";
}
// Charger les données JSON depuis le fichier
$data = json_decode(file_get_contents('listeFlux.json'), true);

// Vérifier si le formulaire a été soumis
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Vérifier si une suppression a été demandée
    if (isset($_POST['delete_flux'])) {
        // Supprimer l'objet de la liste
        unset($data['listeFlux'][$_POST['delete_flux']]);
    } else {
        // Vérifier si une mise à jour a été demandée
        if (isset($_POST['update_flux'])) {
            $nom_flux = $_POST['update_flux'];
            // Mettre à jour les données du flux existant avec les valeurs soumises
            if (isset($_POST[$nom_flux . '_service'])) {
                $data['listeFlux'][$nom_flux]['service'] = $_POST[$nom_flux . '_service'];
            }
            if (isset($_POST[$nom_flux . '_url'])) {
                $data['listeFlux'][$nom_flux]['url'] = $_POST[$nom_flux . '_url'];
            }
            if (isset($_POST[$nom_flux . '_couche'])) {
                $data['listeFlux'][$nom_flux]['couche'] = $_POST[$nom_flux . '_couche'];
            }
            if (isset($_POST[$nom_flux . '_version'])) {
                $data['listeFlux'][$nom_flux]['version'] = $_POST[$nom_flux . '_version'];
            }
        } else {
            // Ajouter un nouveau flux
            $nouveau_flux = array(
                'url' => $_POST['nouveau_url'],
                'couche' => $_POST['nouveau_couche'],
                'service' => $_POST['nouveau_service'],
                'version' => $_POST['nouveau_version']
            );
            if ($_POST['nouveau_nom_flux'] != "" and $_POST['nouveau_url'] != "") {
                $data['listeFlux'][$_POST['nouveau_nom_flux']] = $nouveau_flux;
            } else {
                alert("nn");
            }
        }
    }

    // Sauvegarder les données mises à jour dans le fichier JSON
    file_put_contents('listeFlux.json', json_encode($data, JSON_PRETTY_PRINT));
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style_editeur_flux.css">
    <title>Éditeur de liste de flux</title>
</head>
<body>
    <h1>Éditeur de liste de flux</h1>

    <form method="post">
        <h2>Ajouter un nouveau flux</h2>
        <label for="nouveau_nom_flux">Nom du flux :</label>
        <input type="text" id="nouveau_nom_flux" name="nouveau_nom_flux"><br>
        <label for="nouveau_service">Service :</label>
        <select id="nouveau_service" name="nouveau_service">
            <option value="WMS">WMS</option>
            <option value="XYZ">XYZ</option>
        </select><br>
        <label for="nouveau_url">URL :</label>
        <input type="text" id="nouveau_url" name="nouveau_url"><br>
        <label for="nouveau_couche">Couche (WMS) :</label>
        <input type="text" id="nouveau_couche" name="nouveau_couche"><br>
        <label for="nouveau_version">Version (WMS) :</label>
        <input type="text" id="nouveau_version" name="nouveau_version" value="1.3.0"><br>
        <label for="bouton_enregistrer"></label>
        <input type="submit" id="bouton_enregistrer" value="Enregistrer">

        <?php foreach ($data['listeFlux'] as $nomFlux => $details): ?>
            <div>
                <h2><?= $nomFlux ?></h2>
                <label for="<?= $nomFlux ?>_service">Service :</label>
                <select id="<?= $nomFlux ?>_service" name="<?= $nomFlux ?>_service">
                    <option value="WMS" <?php if($details['service'] == 'WMS') echo 'selected'; ?>>WMS</option>
                    <option value="XYZ" <?php if($details['service'] == 'XYZ') echo 'selected'; ?>>XYZ</option>
                </select><br>
                <label for="<?= $nomFlux ?>_url">URL :</label>
                <input type="text" id="<?= $nomFlux ?>_url" name="<?= $nomFlux ?>_url" value="<?= $details['url'] ?>"><br>
                <label for="<?= $nomFlux ?>_couche">Couche (WMS) :</label>
                <input type="text" id="<?= $nomFlux ?>_couche" name="<?= $nomFlux ?>_couche" value="<?= $details['couche'] ?>"><br>
                <label for="<?= $nomFlux ?>_version">Version (WMS) :</label>
                <input type="text" id="<?= $nomFlux ?>_version" name="<?= $nomFlux ?>_version" value="<?= $details['version'] ?>"><br>
                <label for="bouton_maj"></label>
                <button type="submit" class="bouton_maj" name="update_flux" value="<?= $nomFlux ?>">Mettre à jour</button>
                <button type="submit" class="bouton_supprimer" name="delete_flux" value="<?= $nomFlux ?>">Supprimer</button>
            </div>
        <?php endforeach; ?>
    </form>
</body>
</html>
