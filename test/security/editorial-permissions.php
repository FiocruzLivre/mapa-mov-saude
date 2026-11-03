<?php
declare(strict_types=1);

// Exercise the real LocalSettings switch with isolated synthetic permissions.
// This runs without installing MediaWiki or touching a wiki database.
define('NS_MAIN', 0);
define('NS_FILE', 6);
function wfLoadExtension(string $extension): void {
    $GLOBALS['loaded_extensions'][] = $extension;
}
function check(bool $result, string $reason): void {
    if (!$result) {
        fwrite(STDERR, $reason . "\n");
        exit(1);
    }
}

$expectedMode = $argv[1] ?? '';
check(in_array($expectedMode, ['on', 'off'], true), 'Specify on or off.');
$config = file_get_contents(__DIR__ . '/../../mediawiki/LocalSettings.php');
$marker = '// Content moderation is independent';
$position = strpos($config, $marker);
check($position !== false, 'Cannot locate the editorial configuration.');

$publicationRights = [
    'edit', 'createpage', 'createtalk', 'upload', 'reupload',
    'reupload-shared', 'move', 'move-subpages', 'movefile',
];
$wgGroupPermissions = [];
foreach (['*', 'user', 'autoconfirmed', 'bot', 'reviewer', 'sysop'] as $group) {
    $wgGroupPermissions[$group] = array_fill_keys($publicationRights, true);
}
$wgGroupPermissions['*']['edit'] = false;
$script = tempnam(sys_get_temp_dir(), 'editorial-');
check($script !== false, 'Temporary file could not be created.');
try {
    file_put_contents($script, "<?php\n" . substr($config, $position));
    require $script;
} finally {
    unlink($script);
}

check($wgMapamovEditorialModeration === ($expectedMode === 'on'),
    'Unexpected moderation mode.');
if ($expectedMode === 'on') {
    check(in_array('Moderation', $GLOBALS['loaded_extensions'] ?? [], true),
        'Moderation was not loaded.');
    check($wgModerationOnlyInNamespaces === [NS_MAIN, NS_FILE],
        'Incorrect namespace restrictions.');
    check($wgGroupPermissions['reviewer']['moderation'] === true,
        'Reviewers cannot moderate.');
} else {
    check(!in_array('Moderation', $GLOBALS['loaded_extensions'] ?? [], true),
        'Moderation unexpectedly loaded.');
    foreach ($wgGroupPermissions as $group => $rights) {
        foreach ($publicationRights as $right) {
            check($rights[$right] === ($group === 'sysop'),
                "$group unexpectedly granted $right while moderation is disabled.");
        }
    }
}
echo "editorial permissions safe ($expectedMode)\n";
