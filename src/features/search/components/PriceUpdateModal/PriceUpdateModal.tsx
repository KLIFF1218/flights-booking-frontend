"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Plane } from "lucide-react";

interface PriceUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function PriceUpdateModal({
  open,
  onClose,
  onRefresh,
}: PriceUpdateModalProps) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="
            fixed inset-0 z-[90]
            bg-black/50 backdrop-blur-sm
            animate-in fade-in duration-200
          "
        />

        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 z-[100]
            w-[92vw] max-w-[480px]
            -translate-x-1/2 -translate-y-1/2
            rounded-3xl bg-white p-8
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]
            animate-in fade-in zoom-in-95 duration-300
          "
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="mb-5 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
          </div>

          <Dialog.Title
            className="
              mb-4 text-center
              text-[26px] font-semibold
              leading-tight text-gray-900
            "
          >
            Обновите поиск — цены могли измениться
          </Dialog.Title>

          <Dialog.Description
            className="
              mb-8 text-center
              text-[16px] leading-relaxed
              text-gray-600
            "
          >
            Авиакомпании меняют цены несколько раз в день. Иногда они становятся
            ниже.
          </Dialog.Description>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="
                flex-1 rounded-2xl
                border border-gray-200
                bg-gray-50 px-6 py-4
                text-[17px] font-semibold
                text-gray-700
                transition-all duration-200
                hover:bg-gray-100
              "
            >
              Позже
            </button>

            <button
              onClick={onRefresh}
              className="
                flex-1 rounded-2xl
                bg-gradient-to-r
                from-blue-500 to-indigo-600
                px-6 py-4
                text-[17px] font-semibold
                text-white
                shadow-lg shadow-blue-500/30
                transition-all duration-200
                hover:from-blue-600
                hover:to-indigo-700
              "
            >
              Обновить
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
