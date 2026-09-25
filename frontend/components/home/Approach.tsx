import { ApproachStep } from "@/types/api";
import { approachSteps as defaultSteps } from "@/lib/api";

interface ApproachProps {
  steps?: ApproachStep[];
}

export default function Approach({ steps = defaultSteps }: ApproachProps) {
  return (
    <section id="approach" className="border-b border-zinc-200/80 bg-white py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <h2 className="editorial-title text-3xl sm:text-5xl lg:text-6xl text-zinc-950 tracking-tight mb-6">
            OUR APPROACH
          </h2>
          <p className="text-base sm:text-xl font-medium text-zinc-800 max-w-2xl">
            “Not just a website. A digital system built around how your business works.”
          </p>
        </div>

        {/* 4-Step Process Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="card-hover flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 sm:p-7"
            >
              <div>
                <h3 className="font-sans text-lg sm:text-xl font-bold uppercase tracking-tight text-zinc-950">
                  {step.title}
                </h3>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-zinc-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
