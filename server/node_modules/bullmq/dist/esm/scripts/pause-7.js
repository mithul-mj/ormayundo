const content = `--[[
  Pauses or resumes a queue globally.
  Input:
    KEYS[1] 'wait' or 'paused'
    KEYS[2] 'paused' or 'wait'
    KEYS[3] 'meta'
    KEYS[4] 'prioritized'
    KEYS[5] events stream key
    KEYS[6] 'delayed'
    KEYS[7] 'marker'
    ARGV[1] 'paused' or 'resumed'
    ARGV[2] '1' to emit event, '0' to skip it
  Event:
    publish paused or resumed event.
]]
local rcall = redis.call
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Get count jobs in wait or prioritized.
]]
local function getWaitPlusPrioritizedCount(waitKey, prioritizedKey)
  local waitCount = rcall("LLEN", waitKey)
  local prioritizedCount = rcall("ZCARD", prioritizedKey)
  return waitCount + prioritizedCount
end
local markerKey = KEYS[7]
local emitEvent = ARGV[2] ~= "0"
local legacyPausedRemaining = 0
if ARGV[1] == "paused" then
    rcall("HSET", KEYS[3], "paused", 1)
    rcall("DEL", markerKey)
else
    rcall("HDEL", KEYS[3], "paused")
    --jobs in paused key
    local hasJobs = rcall("EXISTS", KEYS[1]) == 1
    if hasJobs then
        if rcall("EXISTS", KEYS[2]) == 0 then
            rcall("RENAME", KEYS[1], KEYS[2])
        else
            --move a maximum of 7000 jobs per resume call in order to not block
            --using LRANGE 0..6999 so each RPUSH argument list stays bounded
            --if users have more jobs in paused state, call resume multiple times
            local jobs = rcall('LRANGE', KEYS[1], 0, 6999)
            rcall("RPUSH", KEYS[2], unpack(jobs))
            rcall("LTRIM", KEYS[1], #jobs, -1)
            legacyPausedRemaining = rcall("LLEN", KEYS[1])
        end
    end
    if getWaitPlusPrioritizedCount(KEYS[2], KEYS[4]) > 0 then
        -- Add marker if there are waiting or priority jobs
        rcall("ZADD", markerKey, 0, "0")
    else
        addDelayMarkerIfNeeded(markerKey, KEYS[6])
    end
end
if emitEvent then
    rcall("XADD", KEYS[5], "*", "event", ARGV[1]);
end
return legacyPausedRemaining
`;
export const pause = {
    name: 'pause',
    content,
    keys: 7,
};
