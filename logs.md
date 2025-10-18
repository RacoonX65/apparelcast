{
  "event_message": "GET | 400 | 198.54.66.70 | 990946a82d1a73dd | https://ygiverhbkqsxlacakhqc.supabase.co/rest/v1/special_offers?select=*&id=eq.768c01c5-e26f-4b0c-9505-c9f7e493d4aa&is_active=eq.true&valid_until=gte.2025-10-18T16%3A05%3A13.807Z | Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
  "id": "3bf98208-795e-4874-80d5-8e8b5ba8e4f2",
  "metadata": [
    {
      "load_balancer_experimental_routing": null,
      "load_balancer_geo_aware_info": [],
      "load_balancer_redirect_identifier": null,
      "logflare_worker": [
        {
          "worker_id": "PPR190"
        }
      ],
      "request": [
        {
          "cf": [
            {
              "asOrganization": "Technikon Witwatersrand",
              "asn": 2018,
              "botManagement": [
                {
                  "corporateProxy": false,
                  "detectionIds": [],
                  "ja3Hash": "77a3ddaddd5a19be4d15ad4e1b22c4c3",
                  "ja4": "t13d1517h2_8daaf6152771_b6f405a00624",
                  "ja4Signals": [
                    {
                      "browser_ratio_1h": 0.93220806121826,
                      "cache_ratio_1h": 0.30670100450516,
                      "h2h3_ratio_1h": 0.96642166376114,
                      "heuristic_ratio_1h": 0.0013705776073039,
                      "ips_quantile_1h": 0.9999868273735,
                      "ips_rank_1h": 6,
                      "paths_rank_1h": 5,
                      "reqs_quantile_1h": 0.99998903274536,
                      "reqs_rank_1h": 5,
                      "uas_rank_1h": 7
                    }
                  ],
                  "jsDetection": [
                    {
                      "passed": false
                    }
                  ],
                  "score": 98,
                  "staticResource": false,
                  "verifiedBot": false
                }
              ],
              "city": "Johannesburg",
              "clientAcceptEncoding": "gzip, deflate, br",
              "clientTcpRtt": 12,
              "clientTrustScore": 98,
              "colo": "JNB",
              "continent": "AF",
              "country": "ZA",
              "edgeRequestKeepAliveStatus": 1,
              "httpProtocol": "HTTP/2",
              "isEUCountry": null,
              "latitude": "-26.20227",
              "longitude": "28.04363",
              "metroCode": null,
              "postalCode": "2041",
              "region": "Gauteng",
              "regionCode": "GP",
              "requestPriority": "weight=220;exclusive=1",
              "timezone": "Africa/Johannesburg",
              "tlsCipher": "AEAD-AES128-GCM-SHA256",
              "tlsClientAuth": [
                {
                  "certPresented": "0",
                  "certRevoked": "0",
                  "certVerified": "NONE"
                }
              ],
              "tlsClientCiphersSha1": "KuGfs2vBuh8l0G+IPFHc60e2nNk=",
              "tlsClientExtensionsSha1": "+CE1L5oMEpqGgmFwx1v/rWz8XTk=",
              "tlsClientExtensionsSha1Le": "jvg9OkvcYPDvl1pOAlusUCu3bMw=",
              "tlsClientHelloLength": "2068",
              "tlsClientRandom": "JRvQiECclvuG1c4texRVt5WrdWjXrdfplEoIbJ/lZ4M=",
              "tlsExportedAuthenticator": [
                {
                  "clientFinished": "c800f9682c8130ea1c816569cd76e98cf0bac15cabc5f7d9fe1c31d4534e6aea",
                  "clientHandshake": "91ceb8333b5ca837ff1ce2e38e43c640bb18a1e307bf4ec912cc49159e7fa16a",
                  "serverFinished": "dfbf666e3c24f1b8c3b738d80ecb5c4d0abd58b3eb06454f19768978564a8625",
                  "serverHandshake": "051db8c1bbc7abe05a42264aae238716205881b21f86dfd90e6094ddbb3d5d09"
                }
              ],
              "tlsVersion": "TLSv1.3",
              "verifiedBotCategory": null
            }
          ],
          "headers": [
            {
              "accept": "application/vnd.pgrst.object+json",
              "cf_cache_status": null,
              "cf_connecting_ip": "198.54.66.70",
              "cf_ipcountry": "ZA",
              "cf_ray": "990946a82d1a73dd",
              "content_length": null,
              "content_location": null,
              "content_range": null,
              "content_type": null,
              "date": null,
              "host": "ygiverhbkqsxlacakhqc.supabase.co",
              "prefer": null,
              "range": null,
              "referer": "https://www.apparelcast.shop/",
              "sb_gateway_mode": null,
              "sb_gateway_version": null,
              "user_agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
              "x_client_info": "supabase-ssr/0.7.0 createBrowserClient",
              "x_forwarded_host": null,
              "x_forwarded_proto": "https",
              "x_forwarded_user_agent": null,
              "x_kong_proxy_latency": null,
              "x_kong_upstream_latency": null,
              "x_real_ip": "198.54.66.70"
            }
          ],
          "host": "ygiverhbkqsxlacakhqc.supabase.co",
          "method": "GET",
          "path": "/rest/v1/special_offers",
          "port": null,
          "protocol": "https:",
          "sb": [
            {
              "apikey": [],
              "auth_user": "f520cb3d-4c03-4ef5-8d3b-6b9bf768764a",
              "jwt": [
                {
                  "apikey": [
                    {
                      "invalid": null,
                      "payload": [
                        {
                          "algorithm": "HS256",
                          "expires_at": 2072305051,
                          "issuer": "supabase",
                          "role": "anon",
                          "signature_prefix": "6qtcpq",
                          "subject": null
                        }
                      ]
                    }
                  ],
                  "authorization": [
                    {
                      "invalid": null,
                      "payload": [
                        {
                          "algorithm": "HS256",
                          "expires_at": 1760807075,
                          "issuer": "https://ygiverhbkqsxlacakhqc.supabase.co/auth/v1",
                          "key_id": "Op5ROe9kCU45oRH8",
                          "role": "authenticated",
                          "session_id": "ebae515b-7d97-4c24-bc88-7f86eb633108",
                          "signature_prefix": "6IisEe",
                          "subject": "f520cb3d-4c03-4ef5-8d3b-6b9bf768764a"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ],
          "search": "?select=*&id=eq.768c01c5-e26f-4b0c-9505-c9f7e493d4aa&is_active=eq.true&valid_until=gte.2025-10-18T16%3A05%3A13.807Z",
          "url": "https://ygiverhbkqsxlacakhqc.supabase.co/rest/v1/special_offers?select=*&id=eq.768c01c5-e26f-4b0c-9505-c9f7e493d4aa&is_active=eq.true&valid_until=gte.2025-10-18T16%3A05%3A13.807Z"
        }
      ],
      "response": [
        {
          "headers": [
            {
              "cf_cache_status": "DYNAMIC",
              "cf_ray": "990946a8413d73dd-JNB",
              "content_length": null,
              "content_location": null,
              "content_range": null,
              "content_type": "application/json; charset=utf-8",
              "date": "Sat, 18 Oct 2025 16:05:13 GMT",
              "sb_gateway_mode": null,
              "sb_gateway_version": "1",
              "sb_request_id": "0199f811-6525-7888-ab13-78250259a4bf",
              "transfer_encoding": "chunked",
              "x_kong_proxy_latency": null,
              "x_kong_upstream_latency": null,
              "x_sb_error_code": null
            }
          ],
          "origin_time": 273,
          "status_code": 400
        }
      ]
    }
  ],
  "timestamp": 1760803513637000
}