import { ExposureCalculationWorkerRequest, ExposureDataResponse } from "@/lib/types";
import { filterExposureData } from "@/lib/utils";

addEventListener("message", (event: MessageEvent<ExposureCalculationWorkerRequest>) => {
    console.log('worker message received');
    const result = filterExposureData(event.data);
    postMessage(result);
});