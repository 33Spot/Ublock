# identify the disk partition which you want to scan for bad sectors
sudo lsblk -o name,mountpoint,label,size,uuid
# Scan for Bad Sectors
sudo badblocks -v /dev/sda1 > ~/bad_sectors.txt
# Repair Bad Sectors (For ext2, ext3, and ext4 file systems, you can use e2fsck utility)
sudo e2fsck -cfpv /dev/sda1
# You can also specify the bad_sectors.txt file created in the earlier steps as well to force e2fsck to repair those
sudo e2fsck -l bad_sectors.txt /dev/sda1
# For other file systems (such as FAT32), you can use fsck.
sudo fsck -l bad_sectors.txt /dev/sda1

