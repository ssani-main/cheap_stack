#!/bin/bash
# Part of cheap_stack.
# Masks secret-looking values in stdin. Pipe a server helper through it (e.g. ssh ... | mask_secrets.sh) so crontab,
# env files and settings-table output cannot leak keys into chat. Unbuffered, cosmetic only (not a security boundary).
# Self-test: bin/mask_secrets.sh --selftest
read -r -d '' P <<'PERL'
$| = 1;
my $M = '***masked***';
my $KW = qr/pass(?:word|wd)?|pwd|secret|token|signature|credential|api[_-]?key|private[_-]?key|crypt[_-]?key|consumer[_-]?key|access[_-]?key|(?<![a-z])[is]key|(?<![a-z])key/i;
my %SAFE = map { $_ => 1 } qw(url_key meta_keyword meta_keywords key_name keyword keywords sort_key);
our ($cfg, $pem);
if (/^### /) { $cfg = /core_config_data/i && /$KW|twofactorauth|duo/i; }   # run_sql header line: mask every value of a secret config query
if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/) { $pem = 1; print; next; }
if ($pem) { $pem = 0 if /-----END/; print /-----END/ ? $_ : "$M\n"; next; }
if ($cfg || /"path":"[^"]*(?:$KW|twofactorauth)[^"]*"/i) { s/("value":")(?:[^"\\]|\\.)*"/$1$M"/g; }
s{(?<![A-Za-z0-9_])([A-Za-z0-9_-]*?(?:$KW)[A-Za-z0-9_-]*)(["']?\s*(?:=>|:|=)\s*)("(?:[^"\\]|\\.)*"|'[^']*'|[^\s"',;&]{6,})}{
  my ($k, $s, $v) = ($1, $2, $3);
  $SAFE{lc $k} || $v =~ /^["']?\Q$M\E/ ? "$k$s$v" : $v =~ /^(["'])/ ? "$k$s$1$M$1" : "$k$s$M"
}ge;
s/(--[A-Za-z_-]*(?:key|secret|pass|token)[A-Za-z_-]*\s+)(?!-)\S{6,}/$1$M/gi;
s{(://[^/:@\s]*:)[^@\s/]+@}{$1$M\@}g;
s/((?:mysql|mysqldump|mariadb)\b[^|;&]*\s-p)\S+/$1$M/g;
s/(\bBearer\s+)[A-Za-z0-9._~+\/=-]{10,}/$1$M/g;
s/(\bcurl\b[^|;&]*\s-u\s*["']?[^:\s"']+:)[^\s"']+/$1$M/g;
print;
PERL
mask() { perl -ne "$P"; }
if [ "$1" = "--selftest" ]; then
  check() { got=$(printf '%s\n' "$1" | mask); [ "$got" = "$2" ] || { echo "FAIL: [$1] -> [$got], want [$2]"; exit 1; }; }
  m='***masked***'
  check '{"path":"twofactorauth/duo/secret_key","value":"abcDEF123456"}' '{"path":"twofactorauth/duo/secret_key","value":"'$m'"}'
  check '{"path":"twofactorauth\/duo\/integration_key","value":"DIfake123456"}' '{"path":"twofactorauth\/duo\/integration_key","value":"'$m'"}'
  check '{"path":"payment\/payflowpro\/pwd","value":"Zz9fake88"}' '{"path":"payment\/payflowpro\/pwd","value":"'$m'"}'
  check $'### SELECT value FROM core_config_data WHERE path=\'twofactorauth/duo/secret_key\'\n{"value":"Zz9fakeDuo1"}' $'### SELECT value FROM core_config_data WHERE path=\'twofactorauth/duo/secret_key\'\n{"value":"'$m'"}'
  check $'### SELECT value FROM core_config_data WHERE path=\'web/secure/base_url\'\n{"value":"https://x.com/"}' $'### SELECT value FROM core_config_data WHERE path=\'web/secure/base_url\'\n{"value":"https://x.com/"}'
  check '{"path":"web/secure/base_url","value":"https://x.com/"}' '{"path":"web/secure/base_url","value":"https://x.com/"}'
  check '{"url_key":"some-product-123","meta_keyword":"tool set","Key_name":"PRIMARY"}' '{"url_key":"some-product-123","meta_keyword":"tool set","Key_name":"PRIMARY"}'
  check '{"password_hash":"abc:def:123456","rp_token":"Zz9tok123"}' '{"password_hash":"'$m'","rp_token":"'$m'"}'
  check "*/5 * * * * php scanner --key=Zx9fake8key7 --quiet" "*/5 * * * * php scanner --key=$m --quiet"
  check "scanner --key Zx9fake8key7" "scanner --key $m"
  check "'password' => 'fakePw123'," "'password' => '$m',"
  check "'password' => 'Ab&9xKq2LmN'," "'password' => '$m',"
  check "'password' => 'Abcdef;ghijk'," "'password' => '$m',"
  check "'key' => 'a1b2c3d4e5f6'," "'key' => '$m',"
  check "consumer_secret=Ab12cdEf34 access_token: Ab12cdEf34" "consumer_secret=$m access_token: $m"
  check "curl https://api.x.com/?token=abc123def456&x=1" "curl https://api.x.com/?token=$m&x=1"
  check "mysql://root:fakepw99@db:3306/x redis://:fakepw99@r:6379" "mysql://root:$m@db:3306/x redis://:$m@r:6379"
  check "0 3 * * * mysqldump -uroot -pFake9pw1 db > x.sql" "0 3 * * * mysqldump -uroot -p$m db > x.sql"
  check "curl -s -u apiuser:Fake9pw1 https://x" "curl -s -u apiuser:$m https://x"
  check "Authorization: Bearer eyFake0123456789abc" "Authorization: Bearer $m"
  check $'-----BEGIN RSA PRIVATE KEY-----\nMIIfake\n-----END RSA PRIVATE KEY-----' $'-----BEGIN RSA PRIVATE KEY-----\n'$m$'\n-----END RSA PRIVATE KEY-----'
  check "mkdir -p /var/www/x && mysql -e 'select 1'" "mkdir -p /var/www/x && mysql -e 'select 1'"
  check "1a2b3c4d stage pushed; tests passed: 12; whiskey: 1234567" "1a2b3c4d stage pushed; tests passed: 12; whiskey: 1234567"
  check "2026-11-23 cron ran ok" "2026-11-23 cron ran ok"
  echo "selftest ok"; exit 0
fi
mask
