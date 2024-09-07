"use client";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlgorithmFlag } from "@prisma/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { useInstanceParams } from "@/components/params-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoreInformation } from "@/components/ui/more-information";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { allFlags, buildNewAlgorithmSchema } from "@/lib/validations/algorithm";

export function NewAlgorithmForm2({
  takenNames,
  setShowForm,
}: {
  takenNames: string[];
  setShowForm: (s: boolean) => void;
}) {
  const params = useInstanceParams();
  const router = useRouter();

  const { mutateAsync: createAlgorithmAsync } =
    api.institution.instance.algorithm.create.useMutation();

  const utils = api.useUtils();
  const refetchAlgorithms = () =>
    utils.institution.instance.algorithm.getAll.refetch({ params });

  const formSchema = buildNewAlgorithmSchema(takenNames);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { targetModifier: 0, upperBoundModifier: 0 },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const formattedData = {
      ...data,
      displayName: data.algName,
      description: "",
      flag2: data.flag2 ?? null,
      flag3: data.flag3 ?? null,
    };

    void toast.promise(
      createAlgorithmAsync({
        params,
        data: formattedData,
      }).then(() => {
        setShowForm(false);
        refetchAlgorithms();
        router.refresh();
      }),
      {
        loading: "Creating New Algorithm Configuration...",
        error: "Something went wrong",
        success:
          "You successfully created a new custom Algorithm configuration",
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-6"
      >
        <FormField
          control={form.control}
          name="algName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Algorithm Name</FormLabel>
              <FormControl>
                <Input placeholder="custom" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                The name of the algorithm. It must be unique.
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="flex w-full items-start justify-start gap-2">
          <FormField
            control={form.control}
            name="flag1"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Flags</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[140px] justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? allFlags.find((flag) => flag.label === field.value)
                              ?.label
                          : "Select flag"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[140px] p-0">
                    <Command>
                      <CommandInput placeholder="Search flags..." />
                      <CommandEmpty>No flag found.</CommandEmpty>
                      <CommandGroup>
                        {allFlags.map((flag) => (
                          <CommandItem
                            value={flag.value}
                            key={flag.value}
                            onSelect={() => {
                              form.setValue("flag1", flag.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                flag.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {flag.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flag2"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-5">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[140px] justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? allFlags.find((flag) => flag.label === field.value)
                              ?.label
                          : "Select flag"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[140px] p-0">
                    <Command>
                      <CommandInput placeholder="Search flags..." />
                      <CommandEmpty>No flag found.</CommandEmpty>
                      <CommandGroup>
                        {allFlags.map((flag) => (
                          <CommandItem
                            value={flag.value}
                            key={flag.value}
                            onSelect={() => {
                              form.setValue("flag2", flag.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                flag.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {flag.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flag3"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-5">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[140px] justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? allFlags.find((flag) => flag.label === field.value)
                              ?.label
                          : "Select flag"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[140px] p-0">
                    <Command>
                      <CommandInput placeholder="Search flags..." />
                      <CommandEmpty>No flag found.</CommandEmpty>
                      <CommandGroup>
                        {allFlags.map((flag) => (
                          <CommandItem
                            value={flag.value}
                            key={flag.value}
                            onSelect={() => {
                              form.setValue("flag3", flag.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                flag.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {flag.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormDescription className="-mt-4 flex items-center gap-2">
          <span>Select the algorithm flags you want to use.</span>
          <MoreInformation className="flex w-[500px] flex-col gap-2">
            <p>What each flag does and how it affects the matching.</p>
            <AlgorithmFlagInfo flag={AlgorithmFlag.GRE}>
              Performs greedy optimisation at the given optimisation position.
            </AlgorithmFlagInfo>
            <Separator />
            <AlgorithmFlagInfo flag={AlgorithmFlag.GEN}>
              Performs generous optimisation at the given optimisation position.
            </AlgorithmFlagInfo>
            <Separator />
            <AlgorithmFlagInfo flag={AlgorithmFlag.LSB}>
              Minimises the sum of absolute differences between lecturer
              occupancies and targets at the given optimisation position.
            </AlgorithmFlagInfo>
            <Separator />
            <AlgorithmFlagInfo flag={AlgorithmFlag.MAXSIZE}>
              Maximises size at the given optimisation position.
            </AlgorithmFlagInfo>
            <Separator />
            <AlgorithmFlagInfo flag={AlgorithmFlag.MINCOST}>
              Minimises cost at the given optimisation position.
            </AlgorithmFlagInfo>
            <Separator />
            <AlgorithmFlagInfo flag={AlgorithmFlag.MINSQCOST}>
              Minimises sum of squares of costs at the given optimisation
              position.
            </AlgorithmFlagInfo>
          </MoreInformation>
        </FormDescription>

        <FormField
          control={form.control}
          name="targetModifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supervisor Target Modifier</FormLabel>
              <FormControl>
                <Input className="w-20" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                The amount to increase all supervisor targets by.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="upperBoundModifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supervisor Upper Quota Modifier</FormLabel>
              <FormControl>
                <Input className="w-20" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                The amount to increase all supervisor upper quotas by.
              </FormDescription>
            </FormItem>
          )}
        />

        <DialogFooter className="flex w-full justify-end">
          <DialogClose asChild>
            <Button className="w-32" type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button className="w-32" type="submit">
            Create
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function AlgorithmFlagInfo({
  flag,
  children: description,
}: {
  flag: AlgorithmFlag;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Badge>{flag}</Badge>
      <p>{description}</p>
    </div>
  );
}
