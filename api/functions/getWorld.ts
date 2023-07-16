import LDTK, { LDTKTileData } from "../types/LDTK";
import World, {
  WorldEntity,
  WorldLevel,
  WorldTileset,
  WorldTilesetTile,
} from "../types/World";

const getWorld = (ldtk: LDTK): World => {
  const entities: Map<string, WorldEntity> = new Map();
  const levels: Map<string, WorldLevel> = new Map();
  const tilesets: Map<string, WorldTileset> = new Map();
  for (const ldtkDefEntity of ldtk.defs.entities) {
    entities.set(ldtkDefEntity.identifier, {
      color: ldtkDefEntity.color,
    });
  }
  for (const ldtkLevel of ldtk.levels) {
    levels.set(ldtkLevel.identifier, {
      layers: [...ldtkLevel.layerInstances]
        .reverse()
        .map(
          (
            ldtkLayerInstance: LDTK["levels"][0]["layerInstances"][0]
          ): WorldLevel["layers"][0] => {
            const matchedLDTKDefLayer: LDTK["defs"]["layers"][0] | null =
              ldtk.defs.layers.find(
                (ldtkDefLayer: LDTK["defs"]["layers"][0]): boolean =>
                  ldtkDefLayer.uid === ldtkLayerInstance.layerDefUid
              ) ?? null;
            return {
              entityInstances: [],
              id: ldtkLayerInstance.__identifier,
              tileSize: ldtkLayerInstance.__gridSize,
              tiles: ldtkLayerInstance.gridTiles.map(
                (
                  ldtkGridTile: LDTK["levels"][0]["layerInstances"][0]["gridTiles"][0]
                ): WorldLevel["layers"][0]["tiles"][0] => ({
                  id: ldtkGridTile.t,
                  x: ldtkGridTile.px[0],
                  y: ldtkGridTile.px[1],
                })
              ),
              tilesetID:
                matchedLDTKDefLayer !== null &&
                matchedLDTKDefLayer.tilesetDefUid !== null
                  ? ldtk.defs.tilesets.find(
                      (ldtkDefTileset: LDTK["defs"]["tilesets"][0]): boolean =>
                        ldtkDefTileset.uid === matchedLDTKDefLayer.tilesetDefUid
                    )?.identifier ?? null
                  : null,
            };
          }
        ),
    });
  }
  for (const ldtkDefTileset of ldtk.defs.tilesets) {
    tilesets.set(ldtkDefTileset.identifier, {
      height: ldtkDefTileset.pxHei,
      imageSourceID: ldtkDefTileset.relPath
        .substring(0, ldtkDefTileset.relPath.length - 4)
        .substring(7),
      tileSize: ldtkDefTileset.tileGridSize,
      tiles: ldtkDefTileset.customData.map(
        (
          data: LDTK["defs"]["tilesets"][0]["customData"][0]
        ): WorldTilesetTile => {
          const properties: LDTKTileData = JSON.parse(
            data.data
          ) as LDTKTileData;
          return {
            id: data.tileId,
            isCollidable: properties.pmglCollision ?? false,
          };
        }
      ),
      width: ldtkDefTileset.pxWid,
    });
  }
  return {
    entities,
    levels,
    tilesets,
  };
};

export default getWorld;
