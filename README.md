![screencapture-altbeats-lightning-force-lightning-n-Album-Explorer-2024-08-30-14_21_13](https://github.com/user-attachments/assets/cef245b3-cd17-4bf9-b0b6-029fcadf206d)

## SFDX
1. Create a scratch org:

    ```
    sf org create scratch -d -f config/project-scratch-def.json -a altbeats -v alarrdev
    ```

2. Deploy to scratch org:

    ```
    sf project deploy start
    ```

3. Assign Permission Set:

    ```
    sf org assign permset -n El_Melomano
    ```

4. Import data:

    ```
    sf data import bulk --file data/artists.csv --sobject Artist__c --wait 10 --target-org altbeats --line-ending CRLF
    sf data import bulk --file data/albums.csv --sobject Album__c --wait 10 --target-org altbeats --line-ending CRLF
    ```

5. Run script:

    ```
    sf apex run --file scripts/apex/relateArtistToAlbum.apex
    ```