vegeta echo "GET https://localhost:3000/routing/createguest" | vegeta attack -duration=10s -insecure -rate 50 | tee results.bin | vegeta report

vegeta echo "GET https://localhost:3000/routing/createguestdynamic" | vegeta attack - duration=10s -insecure -rate 10 | tee resultsCreateGuestDynamic.bin | vegeta report
vegeta report -type=json resultsCreateGuestDynamic.bin > resultsCreateGuestDynamic.json
cat results.bin | vegeta plot > plot.html
cat results.bin | vegeta report -type="hist[0,200ms, 400ms, 600ms, 800ms, 1000ms, 1200ms, 1400ms, 1600ms, 1800ms, 2000ms]"

vegeta echo "POST https://localhost:3000/routing/getRequiredCSA" | vegeta attack - duration=10s -insecure -rate 10 | tee resultsCreateGuestDynamic.bin | vegeta report
vegeta report -type=json resultsCreateGuestDynamic.bin > resultsCreateGuestDynamic.json
cat results.bin | vegeta plot > plot.html
cat results.bin | vegeta report -type="hist[0,200ms, 400ms, 600ms, 800ms, 1000ms, 1200ms, 1400ms, 1600ms, 1800ms, 2000ms]"
