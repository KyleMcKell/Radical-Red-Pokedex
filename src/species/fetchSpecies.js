async function getSpecies(species){
    footerP("Fetching species")
    const rawSpecies = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/species/species.h`)
    const textSpecies = await rawSpecies.text()

    return regexSpecies(textSpecies, species)
}


async function getBaseStats(species){
    footerP("Fetching base stats")
    const rawBaseStats = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/species/Base_Stats.c`)
    const textBaseStats = await rawBaseStats.text()
    return regexBaseStats(textBaseStats, species)
}

async function getLevelUpLearnsets(species){
    footerP("Fetching level up learnsets")
    const rawLevelUpLearnsets = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/species/Learnsets.c`)
    const textLevelUpLearnsets = await rawLevelUpLearnsets.text()

    const rawLevelUpLearnsetsPointers = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/species/Learnsets.c`)
    const textLevelUpLearnsetsPointers = await rawLevelUpLearnsetsPointers.text()


    const levelUpLearnsetsConversionTable = getLevelUpLearnsetsConversionTable(textLevelUpLearnsetsPointers, species)


    return regexLevelUpLearnsets(textLevelUpLearnsets, levelUpLearnsetsConversionTable, species)
}

async function getTMHMLearnsets(species){
    footerP("Fetching TMHM learnsets")
    const rawTMHMLearnsets = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/species/TM_Tutor_Tables.c`)
    const textTMHMLearnsets = await rawTMHMLearnsets.text()

    return regexTMHMLearnsets(textTMHMLearnsets, species, "gTMHMMoves", "gMoveTutorMoves")
}

async function getTutorLearnsets(species){
    footerP("Fetching tutor learnsets")
    const rawTutorLearnsets = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/species/TM_Tutor_Tables.c`)
    const textTutorLearnsets = await rawTutorLearnsets.text()

    return regexTutorLearnsets(textTutorLearnsets, species, "gMoveTutorMoves", "gTMHMMoves")
}

async function getEvolution(species){
    footerP("Fetching evolution line")
    const rawEvolution = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/species/Evolution%20Table.c`)
    const textEvolution = await rawEvolution.text()

    return regexEvolution(textEvolution, species)
}

async function getForms(species){
    footerP("Fetching alternate forms")
    const rawForms = await fetch(`https://raw.githubusercontent.com/${repo}/master/src/data/pokemon/form_species_tables.h`)
    const textForms = await rawForms.text()

    return regexForms(textForms, species)
}

async function getEggMovesLearnsets(species){
    footerP("Fetching egg moves learnsets")
    const rawEggMoves = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/species/Egg_Moves.c`)
    const textEggMoves = await rawEggMoves.text()

    return regexEggMovesLearnsets(textEggMoves, species)
}

async function getSprite(species){
    footerP("Fetching sprites... this could take a while")

    const rawSprite = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/species/Front_Pic_Table.c`)
    const textSprite = await rawSprite.text()

    return regexSprite(textSprite, species)
}

async function getReplaceAbilities(species){
    const rawReplaceAbilities = await fetch(`https://raw.githubusercontent.com/ydarissep/Radical-Red-Pokedex/main/data/abilities/duplicate_abilities.h`)
    const textReplaceAbilities = await rawReplaceAbilities.text()

    return regexReplaceAbilities(textReplaceAbilities, species)
}


async function cleanSpecies(species){

    Object.keys(species).forEach(name => {
        if(species[name]["baseSpeed"] <= 0){
            for (let i = 0; i < species[name]["forms"].length; i++){
                const targetSpecies = species[name]["forms"][i]
                for (let j = 0; j < species[targetSpecies]["forms"].length; j++){
                    if(species[targetSpecies]["forms"][j] === name){
                        species[targetSpecies]["forms"].splice(j, 1)
                    }
                }
            }
            for (let i = 0; i < species[name]["evolutionLine"].length; i++){
                const targetSpecies = species[name]["evolutionLine"][i]
                for (let j = 0; j < species[targetSpecies]["evolutionLine"].length; j++){
                    if(species[targetSpecies]["evolutionLine"][j] === name){
                        species[targetSpecies]["evolutionLine"].splice(j, 1)
                    }
                }
            }
        }
    })
    Object.keys(species).forEach(name => {
        if(species[name]["baseSpeed"] <= 0){
            delete species[name]
        }
    })


    return species
}




async function buildSpeciesObj(){
    let species = {}
    species = await getSpecies(species)
    
    species = await initializeSpeciesObj(species)
    species = await getEvolution(species)
    //species = await getForms(species) // should be called in that order until here    // done in getLevelUpLearnsets for RR
    species = await getBaseStats(species)
    species = await getLevelUpLearnsets(species)
    species = await getTMHMLearnsets(species)
    species = await getEggMovesLearnsets(species)
    species = await getTutorLearnsets(species)
    species = await getReplaceAbilities(species)
    species = await getSprite(species)





    species = await altFormsLearnsets(species, "forms", "tutorLearnsets")
    species = await altFormsLearnsets(species, "forms", "TMHMLearnsets")


    species = await cleanSpecies(species)


    delete species["SPECIES_ZYGARDE_CORE"]
    delete species["SPECIES_ZYGARDE_CELL"]
    delete species["SPECIES_SHADOW_WARRIOR"]
    delete species["SPECIES_UNKNOWN_MYTHICAL"]

    Object.keys(species).forEach(name => {
        species[name]["tutorLearnsets"].sort((a,b) => a[1] - b[1])
        species[name]["TMHMLearnsets"].sort(function(a,b) {
            a = parseInt(a[1].match(/\d+/)[0])
            b = parseInt(b[1].match(/\d+/)[0])

            return a - b
        })
        species[name]["TMHMLearnsets"].sort(function(a,b) {
            if(a[1].includes("TM")){
                a = 1
            }
            else{
                a = 2
            }
            if(b[1].includes("TM")){
                b = 1
            }
            else{
                b = 2
            }

            return a - b
        })
    })

    await localStorage.setItem("species", LZString.compressToUTF16(JSON.stringify(species)))
    return species
}


function initializeSpeciesObj(species){
    footerP("Initializing species")
    for (const name of Object.keys(species)){
        species[name]["baseHP"] = 0
        species[name]["baseAttack"] = 0
        species[name]["baseDefense"] = 0
        species[name]["baseSpAttack"] = 0
        species[name]["baseSpDefense"] = 0
        species[name]["baseSpeed"] = 0
        species[name]["BST"] = 0
        species[name]["abilities"] = []
        species[name]["type1"] = ""
        species[name]["type2"] = ""
        species[name]["item1"] = ""
        species[name]["item2"] = ""
        species[name]["eggGroup1"] = ""
        species[name]["eggGroup2"] = ""
        species[name]["changes"] = []
        species[name]["levelUpLearnsets"] = []
        species[name]["TMHMLearnsets"] = []
        species[name]["eggMovesLearnsets"] = []
        species[name]["tutorLearnsets"] = []
        species[name]["evolution"] = []
        species[name]["evolutionLine"] = [name]
        species[name]["forms"] = []
        species[name]["sprite"] = ""
    }
    delete species["SPECIES_NONE"]
    delete species["SPECIES_EGG"]
    return species
}


async function fetchSpeciesObj(){
    if(!localStorage.getItem("species"))
        window.species = await buildSpeciesObj()
    else
        window.species = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("species")))


    window.spritesObj = {}
    if(localStorage.getItem("sprites")){
        spritesObj = JSON.parse(localStorage.getItem("sprites"))
        Object.keys(spritesObj).forEach(species => {
            spritesObj[species] = LZString.decompressFromUTF16(spritesObj[species])
        })
    }

    await displaySpecies()
}

