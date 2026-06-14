<?php
// Configuration pour hébergement Namecheap
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers pour compatibilité
header('Content-Type: text/html; charset=UTF-8');

// Vérifier si la requête est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Méthode non autorisée');
}

// Récupérer les données du formulaire
$prenom = trim($_POST['prenom'] ?? '');
$nom = trim($_POST['nom'] ?? '');
$email = trim($_POST['email'] ?? '');
$telephone = trim($_POST['telephone'] ?? '');
$type_projet = $_POST['type_projet'] ?? '';
$date_souhaitee = $_POST['date_souhaitee'] ?? '';
$message = trim($_POST['message'] ?? '');

// Validation des données
$errors = [];

if (empty($prenom)) $errors[] = 'Le prénom est requis';
if (empty($nom)) $errors[] = 'Le nom est requis';
if (empty($email)) $errors[] = 'L\'email est requis';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email invalide';
if (empty($telephone)) $errors[] = 'Le téléphone est requis';
if (empty($type_projet)) $errors[] = 'Le type de projet est requis';

if (!empty($errors)) {
    showErrorPage($errors);
    exit;
}

try {
    // Données à sauvegarder
    $data = [
        'Date de soumission' => date('Y-m-d H:i:s'),
        'Prénom' => $prenom,
        'Nom' => $nom,
        'Email' => $email,
        'Téléphone' => $telephone,
        'Type de projet' => getTypeProjet($type_projet),
        'Date souhaitée' => $date_souhaitee,
        'Message' => $message
    ];
    
    // Sauvegarder dans un fichier CSV (plus simple pour Namecheap)
    // Option 1: Dans le même dossier (par défaut)
    try {
        saveToCSV('contacts_binet.csv', $data);
    } catch (Exception $e) {
        // Fallback: utiliser file_put_contents
        try {
            saveToCSV_Alternative('contacts_binet.csv', $data);
        } catch (Exception $e2) {
            // Fallback final: envoyer seulement par email
            sendNotificationEmail($data);
            // Log l'erreur mais continuer
            error_log("Erreur sauvegarde CSV: " . $e2->getMessage());
        }
    }
    
    // Option 2: Dans un sous-dossier (décommentez si besoin)
    // if (!is_dir('data')) mkdir('data', 0755);
    // saveToCSV('data/contacts_binet.csv', $data);
    
    // Option 3: Avec horodatage (un fichier par mois)
    // $monthly_file = 'contacts_' . date('Y-m') . '.csv';
    // saveToCSV($monthly_file, $data);
    
    // Optionnel: Envoyer un email de notification
    sendNotificationEmail($data);
    
    // Afficher la page de succès
    showSuccessPage();
    
} catch (Exception $e) {
    showErrorPage(['Erreur lors de la sauvegarde : ' . $e->getMessage()]);
}

function getTypeProjet($type) {
    $types = [
        // Gestion des rendez-vous
        'rdv_simple' => 'Planning de rendez-vous simple',
        'rdv_avance' => 'Système de réservation en ligne',
        'rdv_rappels' => 'Rendez-vous avec rappels automatiques SMS/Email',
        
        // Dossiers et données
        'dossiers_basic' => 'Dossiers patients électroniques',
        'dossiers_complet' => 'Gestion complète avec historique',
        'facturation' => 'Facturation et comptabilité',
        
        // Applications mobiles
        'app_patients' => 'Application mobile pour patients',
        'app_medecin' => 'Application mobile pour cabinet',
        'telemedicine' => 'Téléconsultation',
        
        // Solutions spécialisées
        'laboratoire' => 'Gestion de laboratoire',
        'pharmacie' => 'Interface pharmacie',
        'imagerie' => 'Gestion d\'imagerie médicale',
        
        // Services
        'consultation' => 'Consultation personnalisée',
        'formation' => 'Formation équipe',
        'maintenance' => 'Maintenance et support',
        
        // Anciennes valeurs pour compatibilité
        'rdv' => 'Gestion des rendez-vous',
        'dossiers' => 'Dossiers patients',
        'mobile' => 'Application mobile',
        'complet' => 'Solution complète'
    ];
    return $types[$type] ?? $type;
}

function saveToCSV($filename, $data) {
    // Debug: Vérifier le répertoire courant
    $currentDir = getcwd();
    $fullPath = $currentDir . '/' . $filename;
    
    // Debug: Vérifier les permissions
    if (!is_writable($currentDir)) {
        throw new Exception("Le répertoire n'est pas accessible en écriture: $currentDir");
    }
    
    $fileExists = file_exists($filename);
    
    // Essayer d'ouvrir le fichier en mode ajout
    $file = fopen($filename, 'a');
    if (!$file) {
        // Si ça échoue, essayer de créer le fichier d'abord
        $file = fopen($filename, 'w');
        if (!$file) {
            throw new Exception("Impossible de créer le fichier: $fullPath. Vérifiez les permissions.");
        }
        $fileExists = false;
    }
    
    // Ajouter l'en-tête si le fichier n'existe pas
    if (!$fileExists) {
        if (!fputcsv($file, array_keys($data), ';')) {
            fclose($file);
            throw new Exception("Erreur lors de l'écriture de l'en-tête");
        }
    }
    
    // Ajouter les données
    if (!fputcsv($file, array_values($data), ';')) {
        fclose($file);
        throw new Exception("Erreur lors de l'écriture des données");
    }
    
    fclose($file);
    
    // Vérifier que le fichier a bien été créé
    if (!file_exists($filename)) {
        throw new Exception("Le fichier n'a pas été créé: $fullPath");
    }
}

function saveToCSV_Alternative($filename, $data) {
    $fileExists = file_exists($filename);
    $csvLine = '';
    
    // Préparer la ligne CSV
    if (!$fileExists) {
        // Ajouter l'en-tête
        $csvLine .= implode(';', array_keys($data)) . "\n";
    }
    
    // Ajouter les données
    $csvLine .= implode(';', array_map(function($value) {
        // Échapper les caractères spéciaux
        return '"' . str_replace('"', '""', $value) . '"';
    }, array_values($data))) . "\n";
    
    // Écrire dans le fichier
    $result = file_put_contents($filename, $csvLine, FILE_APPEND | LOCK_EX);
    
    if ($result === false) {
        throw new Exception("Impossible d'écrire dans le fichier avec file_put_contents");
    }
}

function sendNotificationEmail($data) {
    $to = 'contact@binetmaroc.me'; // Votre email
    $subject = 'Nouvelle demande de contact - Binet';
    
    $message = "Nouvelle demande de contact reçue :\n\n";
    foreach ($data as $key => $value) {
        $message .= "$key : $value\n";
    }
    
    $headers = 'From: noreply@' . $_SERVER['HTTP_HOST'] . "\r\n" .
               'Reply-To: ' . $data['Email'] . "\r\n" .
               'X-Mailer: PHP/' . phpversion();
    
    @mail($to, $subject, $message, $headers);
}

function showSuccessPage() {
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message envoyé - Binet</title>
        <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
            .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
            .success-icon { font-size: 4rem; color: #22c55e; margin-bottom: 20px; }
            h1 { color: #353384; margin-bottom: 20px; }
            p { color: #64748b; line-height: 1.6; margin-bottom: 30px; }
            .btn { display: inline-block; padding: 12px 30px; background: #353384; color: white; text-decoration: none; border-radius: 8px; transition: all 0.3s ease; }
            .btn:hover { background: #0057a3; transform: translateY(-2px); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">✅</div>
            <h1>Message envoyé avec succès !</h1>
            <p>Merci pour votre intérêt pour nos services. Nous avons bien reçu votre demande et nous vous contacterons dans les plus brefs délais.</p>
            <p>Notre équipe étudiera votre projet et vous proposera une solution adaptée à vos besoins médicaux.</p>
            <a href="index.html" class="btn">Retour à l'accueil</a>
        </div>
        <script>
            // Redirection automatique après 5 secondes
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 5000);
        </script>
    </body>
    </html>
    <?php
}

function showErrorPage($errors) {
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erreur - Binet</title>
        <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
            .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
            .error-icon { font-size: 4rem; color: #ef4444; margin-bottom: 20px; }
            h1 { color: #ef4444; margin-bottom: 20px; }
            ul { text-align: left; color: #64748b; }
            .btn { display: inline-block; padding: 12px 30px; background: #353384; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-icon">❌</div>
            <h1>Erreur lors de l'envoi</h1>
            <ul>
                <?php foreach ($errors as $error): ?>
                    <li><?php echo htmlspecialchars($error); ?></li>
                <?php endforeach; ?>
            </ul>
            <a href="index.html#contact" class="btn">Retour au formulaire</a>
        </div>
    </body>
    </html>
    <?php
}
?>
