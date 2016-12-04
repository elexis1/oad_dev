RMS.LoadLibrary("rmgen");
RMS.LoadLibrary("rmgen2");

setFogThickness(0.36);
setFogFactor(0.4);

setPPEffect("hdr");
setPPSaturation(0.48);
setPPContrast(0.53);
setPPBloom(0.12);

var tPrimary = ["savanna_grass_a"];
var tForestFloor = "savanna_forestfloor_a";
var tCliff = ["savanna_cliff_a", "savanna_cliff_a_red", "savanna_cliff_b", "savanna_cliff_b_red"];
var tSecondary = "savanna_grass_b";
var tGrassShrubs = ["savanna_shrubs_a"];
var tGrass = ["savanna_grass_a_wetseason", "savanna_grass_b_wetseason"];
var tDirt = "savanna_dirt_a";
var tDirt2 = "savanna_dirt_a_red";
var tDirt3 = "savanna_dirt_b";
var tDirt4 = "savanna_dirt_rocks_a";
var tCitytiles = "savanna_tile_a";
var tShore = "savanna_riparian_bank";
var tWater = "savanna_riparian_wet";

// gaia entities
var oBaobab = "gaia/flora_tree_baobab";
var oPalm = "gaia/flora_tree_senegal_date_palm";
var oBerryBush = "gaia/flora_bush_berry";
var oChicken = "gaia/fauna_chicken";
var oWildebeest = "gaia/fauna_wildebeest";
var oZebra = "gaia/fauna_zebra";
var oRhino = "gaia/fauna_rhino";
var oLion = "gaia/fauna_lion";
var oLioness = "gaia/fauna_lioness";
var oHawk = "gaia/fauna_hawk";
var oGiraffe = "gaia/fauna_giraffe";
var oGiraffe2 = "gaia/fauna_giraffe_infant";
var oGazelle = "gaia/fauna_gazelle";
var oElephant = "gaia/fauna_elephant_african_bush";
var oElephant2 = "gaia/fauna_elephant_african_infant";
var oCrocodile = "gaia/fauna_crocodile";
var oFish = "gaia/fauna_fish";
var oStoneSmall = "gaia/geology_stone_savanna_small";
var oMetalLarge = "gaia/geology_metal_savanna_slabs";

// decorative props
var aBush = "actor|props/flora/bush_medit_sm_dry.xml";
var aRock = "actor|geology/stone_savanna_med.xml";

//other constants
const pForest = [tForestFloor + TERRAIN_SEPARATOR + oPalm, tForestFloor];
const PI12 = PI / 6;

function placeStoneMineFormation(x, z)
{
	var placer = new ChainPlacer(1, 2, 2, 1, x, z, undefined, [5]);
	var painter = new TerrainPainter(tDirt4);
	createArea(placer, painter, null);

	var bbAngle = randFloat(0, TWO_PI);
	const bbDist = 2.5;

	for (var i = 0; i < 8; ++i)
	{
		var bbX = round(x + (bbDist + randFloat(0,1)) * cos(bbAngle));
		var bbZ = round(z + (bbDist + randFloat(0,1)) * sin(bbAngle));

		placeObject(bbX, bbZ, oStoneSmall, 0, randFloat(0, TWO_PI));

		bbAngle += PI12;
	}
}

const BUILDING_ANGlE = -PI/4;


// initialize map
log("Initializing map...");

InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();
const mapArea = mapSize*mapSize;

function randomStartingPositionPattern()
{
	var formats = ["radial"];
		formats.push("random");

	return {
		"setup": formats[randInt(formats.length)],
		"distance": randFloat(0.3, 0.35),
		"separation": randFloat(0.06, 0.1)
	};
}

RMS.SetProgress(20);
// create tile classes
var clPlayer = createTileClass();
var clHill = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clSettlement = createTileClass();

//cover the ground with the primary terrain chosen in the beginning
for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
		var x = ix / (mapSize + 1.0);
		var z = iz / (mapSize + 1.0);
			placeTerrain(ix, iz, tPrimary);
	}
}

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; i++)
{
	playerIDs.push(i+1);
}
playerIDs = sortPlayers(playerIDs);

// place players
var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerAngle = new Array(numPlayers);

var startAngle = randFloat(0, TWO_PI);
for (var i = 0; i < numPlayers; i++)
{
	playerAngle[i] = startAngle + i*TWO_PI/numPlayers;
	playerX[i] = 0.5 + 0.35*cos(playerAngle[i]);
	playerZ[i] = 0.5 + 0.35*sin(playerAngle[i]);
}

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");

	// some constants
	var radius = scaleByMapSize(15,25);
	var cliffRadius = 2;
	var elevation = 20;

	// get the x and z in tiles
	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = round(fx);
	var iz = round(fz);
	addToClass(ix, iz, clPlayer);
	addToClass(ix+5, iz, clPlayer);
	addToClass(ix, iz+5, clPlayer);
	addToClass(ix-5, iz, clPlayer);
	addToClass(ix, iz-5, clPlayer);

	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tPrimary,tCitytiles], [1]);
	createArea(placer, painter, null);

	// create starting units
	placeCivDefaultEntities(fx, fz, id);

	placeDefaultChicken(fx, fz, clBaseResource);

	// create animals
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oChicken, 5,5, 0,2)],
			true, clBaseResource, aX, aZ
		);
		createObjectGroup(group, 0);
	}

	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oBerryBush, 5,5, 0,3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);

	// create metal mine
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
	var mDist = 12;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oMetalLarge, 1,1, 0,0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	placeStoneMineFormation(mX, mZ);
	addToClass(mX, mZ, clPlayer);

	// create starting trees
	var tAngle = randFloat(-PI/3, 4*PI/3);
	var tDist = randFloat(11, 13);
	var tX = round(fx + tDist * cos(tAngle));
	var tZ = round(fz + tDist * sin(tAngle));
	group = new SimpleGroup(
		[new SimpleObject(oBaobab, 2,7)],
		false, clBaseResource, tX, tZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2));
};

RMS.SetProgress(20);

// create hills
	createHills([tDirt2, tCliff, tGrassShrubs], avoidClasses(clPlayer, 35, clForest, 20, clHill, 20, clWater, 2), clHill, scaleByMapSize(5, 8));

RMS.SetProgress(30);

var lakeAreas = [];
var playerConstraint = new AvoidTileClassConstraint(clPlayer, 20);
var waterConstraint = new AvoidTileClassConstraint(clWater, 8);

for (var x = 0; x < mapSize; ++x)
	for (var z = 0; z < mapSize; ++z)
		if (playerConstraint.allows(x, z) && waterConstraint.allows(x, z))
			lakeAreas.push([x, z]);

var chosenPoint;
var lakeAreaLen;

// create water holes
log("Creating water holes...");
placer = new ChainPlacer(1, floor(scaleByMapSize(3, 5)), floor(scaleByMapSize(60, 100)), 5);
var terrainPainter = new LayeredPainter(
	[tShore, tWater],		// terrains
	[1]							// widths
);
var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, -5, 7);
createAreas(
	placer,
	[terrainPainter, elevationPainter, paintClass(clWater)],
	avoidClasses(clPlayer, 22, clWater, 8, clHill, 2),
	scaleByMapSize(2, 5)
);

RMS.SetProgress(45);

paintTerrainBasedOnHeight(3, floor(scaleByMapSize(20, 40)), 0, tCliff);
paintTerrainBasedOnHeight(floor(scaleByMapSize(20, 40)), 100, 3, tGrass);

// create bumps
createBumps(avoidClasses(clWater, 2, clPlayer, 20));

// create forests
createForests(
 [tPrimary, tForestFloor, tForestFloor, pForest, pForest],
 avoidClasses(clPlayer, 20, clForest, 22, clHill, 2, clWater, 2),
 clForest,
 1.0
);

// create dirt patches
log("Creating dirt patches...");
createLayeredPatches(
 [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)],
 [[tDirt,tDirt3], [tDirt2,tDirt4]],
 [2],
 avoidClasses(clWater, 3, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 12)
);

// create shrubs
log("Creating shrubs...");
createPatches(
 [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
 tGrassShrubs,
 avoidClasses(clWater, 3, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 12)
);

// create grass patches
log("Creating grass patches...");
createPatches(
 [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
 tSecondary,
 avoidClasses(clWater, 3, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 12)
);

RMS.SetProgress(60);

log("Creating stone mines...");
// create stone quarries
createMines(
 [
  [new SimpleObject(oStoneSmall, 0,2, 0,4)],
  [new SimpleObject(oStoneSmall, 2,5, 1,3)]
 ],
 avoidClasses(clWater, 3, clForest, 1, clPlayer, 20, clRock, 10, clHill, 1)
)

log("Creating metal mines...");
// create large metal quarries
createMines(
 [
  [new SimpleObject(oMetalLarge, 1,1, 0,4)]
 ],
 avoidClasses(clWater, 3, clForest, 1, clPlayer, 20, clMetal, 18, clRock, 5, clHill, 1),
 clMetal
);

RMS.SetProgress(70);

// create land decoration
createDecoration
(
 [
  [new SimpleObject(aBush, 1,3, 0,1)],
  [new SimpleObject(aRock, 1,2, 0,1)]
 ],
 [
  scaleByMapSize(8, 131),
  scaleByMapSize(8, 131),
 ],
 avoidClasses(clWater, 0, clForest, 0, clPlayer, 0, clHill, 0)
);

RMS.SetProgress(75);

// create giraffes
log("Creating giraffes...");
group = new SimpleGroup(
	[new SimpleObject(oGiraffe, 2,4, 0,4), new SimpleObject(oGiraffe2, 0,2, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 20, clFood, 11, clHill, 4),
	scaleByMapSize(4,12), 50
);

// create elephants
log("Creating elephants...");
group = new SimpleGroup(
	[new SimpleObject(oElephant, 2,4, 0,4), new SimpleObject(oElephant2, 0,2, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 20, clFood, 11, clHill, 4),
	scaleByMapSize(4,12), 50
);

// create lions
log("Creating lions...");
group = new SimpleGroup(
	[new SimpleObject(oLion, 0,1, 0,4), new SimpleObject(oLioness, 2,3, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 20, clFood, 11, clHill, 4),
	scaleByMapSize(4,12), 50
);

// create other land/air animals
createFood
(
 [
  [new SimpleObject(oHawk, 1,1, 0,3)],
  [new SimpleObject(oGazelle, 3,5, 0,3)],
  [new SimpleObject(oZebra, 3,5, 0,3)],
  [new SimpleObject(oWildebeest, 4,6, 0,3)],
  [new SimpleObject(oRhino, 1,1, 0,3)]
 ],
 [
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers
 ],
 avoidClasses(clFood, 20, clWater, 5, clHill, 2, clPlayer, 16)
);

// create water/shore animals
createFood
(
 [
  [new SimpleObject(oCrocodile, 2,3, 0,3)]
 ],
 [
  3 * numPlayers,

 ],
 stayClasses(clWater, 6)
);

// create fruits
createFood
(
 [
  [new SimpleObject(oBerryBush, 5,7, 0,4)]
 ],
 [
  randInt(1, 4) * numPlayers + 2
 ],
 avoidClasses(clWater, 3, clForest, 0, clPlayer, 20, clHill, 1, clFood, 10)
);

// create fish
createFood
(
 [
  [new SimpleObject(oFish, 2,3, 0,2)]
 ],
 [
  15 * numPlayers
 ],
 [avoidClasses(clFood, 20), stayClasses(clWater, 6)]
);

RMS.SetProgress(85);

// create straggler trees
var types = [oBaobab];
createStragglerTrees(types, avoidClasses(clWater, 5, clForest, 2, clHill, 1, clPlayer, 12, clMetal, 1, clRock, 1));

setSkySet("sunny");
setSunRotation(randFloat(0, TWO_PI));
setSunElevation(randFloat(PI/ 4, PI / 2));
setWaterColor(0.223, 0.247, 0.2);				// dark majestic blue
setWaterTint(0.462, 0.756, 0.566);				// light blue
setWaterMurkiness(5.92);
setWaterWaviness(0);
setWaterType("clap");

// Export map data
ExportMap();
