/* ═══════════════════════════════════════════════════════════
   Threat Counter — Data Layer
   Mock data generators and constants for the threat dashboard.
   ═══════════════════════════════════════════════════════════ */

window.ThreatCounterData = (function () {
  'use strict';

  /* ── Constants ── */
  const ATTACK_TYPES  = ["Port Scan","Brute Force","DDoS","SQL Injection","XSS Attack","MITM","Malware C2","Phishing","DNS Tunneling","Ransomware"];
  const SEVERITIES    = ["critical","high","medium","low"];
  const STATUSES      = ["active","mitigated","investigating"];
  const PROTOCOLS     = ["TCP","UDP","HTTP","HTTPS","SSH","FTP","DNS","ICMP"];
  const COUNTRIES     = ["US","RU","CN","BR","DE","KR","IR","UA","IN","JP"];
  const COUNTRY_NAMES = {
    US:"United States", RU:"Russia", CN:"China", BR:"Brazil",
    DE:"Germany", KR:"South Korea", IR:"Iran", UA:"Ukraine",
    IN:"India", JP:"Japan",
  };
  const COUNTRY_FLAGS = {
    US:'🇺🇸', RU:'🇷🇺', CN:'🇨🇳', BR:'🇧🇷', DE:'🇩🇪',
    KR:'🇰🇷', IR:'🇮🇷', UA:'🇺🇦', IN:'🇮🇳', JP:'🇯🇵',
  };

  /* ── Generators ── */
  function generateThreats(count) {
    count = count || 30;
    return Array.from({ length: count }, function (_, i) {
      return {
        id:            'THR-' + String(1000 + i).padStart(4, '0'),
        type:          ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
        severity:      SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
        status:        STATUSES[Math.floor(Math.random() * STATUSES.length)],
        sourceIp:      (Math.floor(Math.random()*223)+1)+'.'+Math.floor(Math.random()*255)+'.'+Math.floor(Math.random()*255)+'.'+Math.floor(Math.random()*255),
        targetPort:    [22,80,443,3306,8080,21,25,3389,53,8443][Math.floor(Math.random()*10)],
        protocol:      PROTOCOLS[Math.floor(Math.random()*PROTOCOLS.length)],
        country:       COUNTRIES[Math.floor(Math.random()*COUNTRIES.length)],
        timestamp:     new Date(Date.now() - Math.random()*86400000).toISOString(),
        trafficVolume: Math.floor(Math.random()*9000)+100,
        failedLogins:  Math.floor(Math.random()*200),
        confidence:    Math.floor(Math.random()*40)+60,
        payload:       Math.random() > 0.5 ? "Encrypted" : "Cleartext",
      };
    });
  }

  function generateTimeData() {
    return Array.from({ length: 24 }, function (_, i) {
      return {
        hour:    String(i).padStart(2, '0') + ':00',
        attacks: Math.floor(Math.random()*80)+5,
        traffic: Math.floor(Math.random()*4000)+500,
      };
    });
  }

  /* ── Public API ── */
  return {
    ATTACK_TYPES:   ATTACK_TYPES,
    SEVERITIES:     SEVERITIES,
    STATUSES:       STATUSES,
    PROTOCOLS:      PROTOCOLS,
    COUNTRIES:      COUNTRIES,
    COUNTRY_NAMES:  COUNTRY_NAMES,
    COUNTRY_FLAGS:  COUNTRY_FLAGS,
    generateThreats:  generateThreats,
    generateTimeData: generateTimeData,
  };
})();
