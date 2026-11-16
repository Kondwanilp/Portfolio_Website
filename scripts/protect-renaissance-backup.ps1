param(
    [ValidateSet('Protect', 'Verify', 'WrapKey', 'UnwrapKey')][string]$Mode = 'Protect',
    [Parameter(Mandatory = $true)][string]$File
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security
$backupRoot = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'ProjectRenaissance\Backups'))
$target = [IO.Path]::GetFullPath($File)
if (-not $target.StartsWith($backupRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Backup must stay in the private Renaissance backup directory.' }
if ($Mode -eq 'Protect' -or $Mode -eq 'WrapKey') {
    if (Test-Path -LiteralPath $target) { throw 'Choose a new backup filename.' }
    [void][IO.Directory]::CreateDirectory($backupRoot)
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent().User
    $acl = [IO.Directory]::GetAccessControl($backupRoot, [Security.AccessControl.AccessControlSections]::Access)
    $acl.SetAccessRuleProtection($true, $false)
    foreach ($existingRule in $acl.GetAccessRules($true, $false, [Security.Principal.SecurityIdentifier])) { [void]$acl.RemoveAccessRuleSpecific($existingRule) }
    $rule = New-Object Security.AccessControl.FileSystemAccessRule($identity, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
    $acl.AddAccessRule($rule)
    [IO.Directory]::SetAccessControl($backupRoot, $acl)
    $inputText = [Console]::In.ReadToEnd()
    $plain = [Convert]::FromBase64String($inputText)
    $encrypted = [Security.Cryptography.ProtectedData]::Protect($plain, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    if ($Mode -eq 'Protect') { [IO.File]::WriteAllBytes($target, $encrypted) }
    $restored = [Security.Cryptography.ProtectedData]::Unprotect($encrypted, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    $sha = [Security.Cryptography.SHA256]::Create()
    $before = [Convert]::ToBase64String($sha.ComputeHash($plain))
    $after = [Convert]::ToBase64String($sha.ComputeHash($restored))
    if ($before -ne $after) { throw 'Encrypted backup round-trip verification failed.' }
    [Array]::Clear($plain, 0, $plain.Length)
    [Array]::Clear($restored, 0, $restored.Length)
    if ($Mode -eq 'WrapKey') { [PSCustomObject]@{ wrappedKey = [Convert]::ToBase64String($encrypted) } | ConvertTo-Json -Compress }
    else { [PSCustomObject]@{ verified = $true; file = $target; encryptedBytes = $encrypted.Length; sha256 = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash } | ConvertTo-Json -Compress }
} elseif ($Mode -eq 'UnwrapKey') {
    $wrapped = [Convert]::FromBase64String([Console]::In.ReadToEnd())
    $restored = [Security.Cryptography.ProtectedData]::Unprotect($wrapped, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    [PSCustomObject]@{ key = [Convert]::ToBase64String($restored) } | ConvertTo-Json -Compress
    [Array]::Clear($restored, 0, $restored.Length)
} else {
    $restored = [Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($target), $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    [PSCustomObject]@{ verified = $true; decryptedBytes = $restored.Length; sha256 = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash } | ConvertTo-Json -Compress
    [Array]::Clear($restored, 0, $restored.Length)
}
