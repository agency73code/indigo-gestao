
import{Sheet, SheetTrigger, SheetContent} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'


export default function Sidebar() {
    return (
        <div className="flex w-full flex-col bg-muted/40 p-4 border-r">
            <div className="flex flex-col">
                <Sheet>
                    <SheetTrigger>
                        <Button>
                            <span>Open Sidebar</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}

