"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { History } from "@/interfaces/custom";
import SubmitImg from "@/assets/images/submit.svg";
import useSpeechRecognition from "@/hooks/useSpeechToText";
import ClipLoader from "react-spinners/ClipLoader";
import { fetchData } from "@/utils/api";

interface Props {
  recordAllowed: boolean;
  setAADResult: React.Dispatch<React.SetStateAction<any>>;
  setSummary: React.Dispatch<React.SetStateAction<any>>;
  isNewRecord: boolean;
  setIsNewRecord: Function;
}

export default function Transcript({
  recordAllowed,
  setAADResult,
  setSummary,
  isNewRecord,
  setIsNewRecord,
}: Props) {
  const [history, setHistory] = useState<History[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const {
    recognizedText,
    isRecording,
    startSpeechRecognition,
    stopSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!isRecording && recognizedText) {
      const time = new Date().toISOString();
      setIsTranslating(false);
      setIsReady(true);
      setHistory((prev) => [
        ...prev,
        { timestamp: time, patient: recognizedText },
      ]);
    }
  }, [isRecording, recognizedText]);

  useEffect(() => {
    if (!isRecording && recordAllowed) {
      startSpeechRecognition();
    }
  }, [isRecording, recordAllowed]);

  useEffect(() => {
    if (!recordAllowed) {
      stopSpeechRecognition();
    }
  }, [recordAllowed]);

  useEffect(() => {
    if (recognizedText) {
      setIsTranslating(true);
    }
  }, [recognizedText]);

  useEffect(() => {
    if (isReady) {
      setAADResult(undefined);
      setSummary(undefined);
      setIsReady(false);
      fetchData({ historyData: history }, setHistory, setAADResult, setSummary);
    }
  }, [isReady]);

  useEffect(() => {
    if (isNewRecord) {
      setIsNewRecord(false);
      setHistory([]);
      setIsReady(false);
      setIsTranslating(false);
    }
  }, [isNewRecord]);

  return (
    <div className="relative h-[100%] w-[100%]">
      <div
        className="px-[45px] mx-[auto] overflow-y-auto"
        style={{ height: "calc(100% - 60px)" }}
      >
        <ul>
          {history?.map((item: History) => {
            const current_time = new Date().toISOString();
            const delta_time =
              new Date(current_time).getTime() -
              new Date(item.timestamp).getTime();
            const minutesAgo = Math.floor(delta_time / (1000 * 60));
            return (
              <li key={item.timestamp} className="mt-2">
                <h1 className="text-black-0 text-fs-5 font-[600] leading-[95%]">
                  {minutesAgo}m ago
                </h1>
                <p className="mt-[5px] text-black-3 text-fs-2 font-[400] leading-[95%">
                  {item.patient || item.paco}
                </p>
              </li>
            );
          })}
        </ul>
        {isTranslating && (
          <div className="mt-4 flex justify-center items-center">
            <ClipLoader
              loading={true}
              size={20}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 px-[25px] w-[100%] h-[60px]">
        <div className="flex justify-center items-center w-[100%] h-[100%]">
          <div className="flex justify-between items-center w-[100%]">
            <input
              className="w-[305px] px-[8px] py-[11px] bg-black-5 text-black-0 text-fs-3 font-[600] leading-[95%] rounded-br-2"
              placeholder="Enter your sentence"
            />
            <button className="flex justify-center items-center w-[40px] h-[40px] bg-black-5">
              <Image src={SubmitImg} alt="No Submit image" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}