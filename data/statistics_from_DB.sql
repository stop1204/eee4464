
-- /* postgresql */
-- WITH parsed AS (
--     SELECT
--         s.sensor_type,
--         /* 取 JSON 中唯一的数值字段并转数值型 */
--         (jsonb_each_text(sd.json_data::jsonb)).value::numeric AS value
-- FROM sensor_data sd
--     JOIN sensors s ON s.sensor_id = sd.sensor_id
--     )
-- SELECT
--     sensor_type              AS "Sensor Type",
--     COUNT(*)                 AS n,
--     MIN(value)               AS min_value,
--     MAX(value)               AS max_value,
--     ROUND(AVG(value), 2)     AS avg_value,
--     PERCENTILE_CONT(0.5)     WITHIN GROUP (ORDER BY value) AS median_value,
--   ROUND(STDDEV_POP(value), 2)  AS stddev_pop
-- FROM parsed
-- GROUP BY sensor_type
-- ORDER BY sensor_type;


WITH parsed AS (
    SELECT
        s.sensor_type,
        -- Use json_extract to get the 'value' field from the JSON data
        -- NOTE: This assumes your JSON looks like {"value": ...}
        json_extract(sd.json_data, '$.value') AS value
FROM sensor_data AS sd
    JOIN sensors AS s
ON s.sensor_id = sd.sensor_id
    )
SELECT
    sensor_type AS "Sensor Type",
    COUNT(value) AS n,
    MIN(value) AS min_value,
    MAX(value) AS max_value,
    ROUND(AVG(value), 2) AS avg_value
FROM parsed
GROUP BY
    sensor_type
ORDER BY
    sensor_type;